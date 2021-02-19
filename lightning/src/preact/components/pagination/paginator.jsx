import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Paginator extends BaseComponent {
    constructor() {
        super();

        this.state = {
            total: null,
        };
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.isFunction(this.context.registerPaginator) && _.isFunction(this.context.doPagination)) {
            this.context.registerPaginator(this);
            this.context.doPagination({
                page: this.getPageChange(1),
            });
        }
    }

    getNumber(str) {
        return _.parseInt(str) || 0;
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        const pageChanged = this.getNumber(this.props.currentPage) !== this.getNumber(nextProps.currentPage);
        const pageSizeChanged = this.getNumber(this.props.pageSize) !== this.getNumber(nextProps.pageSize);

        let currentPage = this.props.currentPage;
        let pageSize = this.props.pageSize;

        if(pageChanged) {
            currentPage = nextProps.currentPage;
        }

        if(pageSizeChanged) {
            pageSize = nextProps.pageSize;
            currentPage = 1;
        }

        if(_.isFunction(this.context.doPagination)) {
            this.context.doPagination({
                page: this.getPageChange(currentPage, pageSize),
            });
        }
    }

    setTotal(total) {
        this.setState({
            total,
        }, () => {
            const totalPages = _.ceil(this.getTotal() / this.prop('pageSize'));
            let page = this.prop('currentPage');
            page = page <= totalPages ? page : totalPages;
            this.gotoPage(page);
        });
    }

    getTotal() {
        return !_.isUndefined(this.props.total) ? this.props.total : this.state.total;
    }

    getPageChange(page, pSize) {
        const total = this.getTotal();
        const pageSize = pSize || this.props.pageSize;
        return {
            page,
            pageSize,
            startIndex: _.max([(page - 1) * pageSize, 0]),
            endIndex: _.min([page * pageSize, total <= 0 ? Number(pageSize) : total]),
        };
    }

    gotoPage(page) {
        if(this.prop("currentPage") !== page) {
            if(_.isFunction(this.props.onPageChanged)) {
                this.props.onPageChanged(this.getPageChange(page));
            }
        }
    }

    render(props, state) {
        const [{
            className,
            pageSize,
            currentPage,
            pageRange,
            autoHide,
            onPageChanged,
        }, rest] = this.getPropValues();

        const total = this.getTotal();
        const endPageIndexNum = _.isNumber(this.props.endPageIndex) ? this.props.endPageIndex : Infinity;
        const totalPages = total < 0 ? endPageIndexNum : _.ceil(total / pageSize);
        const startPage = _.max([1, currentPage - pageRange]);
        const endPage = _.min([totalPages, currentPage + pageRange, endPageIndexNum]);

        return (
            <ul className={ window.$Utils.classnames(
                {
                    'slds-paginator slds-paginator_default': true,
                    'slds-hide': totalPages <= 1 && autoHide,
                },
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                <li className={ startPage > 1 ? '' : 'disabled' } onClick={ e => startPage > 1 ? this.gotoPage(1) : null }>&lt;&lt;</li>
                <li className={ currentPage > 1 ? '' : 'disabled' } onClick={ e => currentPage > 1 ? this.gotoPage(currentPage - 1) : null }>&lt;</li>
                {
                    _.range(startPage, endPage + 1).map(page => {
                        return (
                        <li className={ page === currentPage ? 'active' : '' } onClick={ e => this.gotoPage(page) }>{ page }</li>
                        );
                    })
                }
                <li className={ currentPage < totalPages ? '' : 'disabled' } onClick={ e => currentPage < totalPages ? this.gotoPage(currentPage + 1) : null }>&gt;</li>
                {
                    total >= 0 && (
                    <li className={ endPage < totalPages ? '' : 'disabled' } onClick={ e => endPage < totalPages ? this.gotoPage(totalPages) : null }>&gt;&gt;</li>
                    )
                }
            </ul>
        );
    }
}

Paginator.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    total: PropTypes.isNumber('total').demoValue(50),
    pageSize: PropTypes.isNumber('pageSize').defaultValue(5).demoValue(5),
    currentPage: PropTypes.isNumber('currentPage').defaultValue(1).demoValue(1),
    pageRange: PropTypes.isNumber('pageRange').defaultValue(2).demoValue(2),
    endPageIndex: PropTypes.isNumber('endPageIndex').description('used to indicate the end of server pagination'),
    onPageChanged: PropTypes.isFunction('onPageChanged'),
    autoHide: PropTypes.isBoolean('autoHide').defaultValue(true).demoValue(true),
};

Paginator.propTypesRest = true;
Paginator.displayName = "Paginator";
