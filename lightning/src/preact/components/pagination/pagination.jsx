import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Pagination extends BaseComponent {
    constructor() {
        super();

        // for paginator
        this.$paginator = undefined;
        this.$total = undefined;

        // for paginated
        this.$paginated = undefined;
        this.$page = undefined;
    }

    registerPaginator(paginator) {
        this.$paginator = paginator;
    }

    unregisterPaginator(paginator) {
        this.$paginator = null;
        this.$total = null;
    }

    registerPaginated(paginated) {
        this.$paginated = paginated;
    }

    unregisterPaginated(paginated) {
        this.$paginated = null;
        this.$page = null;
    }

    isInvalidPage(page) {
        return _.isUndefined(page.page) ||
            _.isUndefined(page.startIndex) ||
            _.isUndefined(page.endIndex);
    }

    doPagination(data) {
        if(!_.isUndefined(data.total)) {
            this.$total = data.total;
        }

        if(!this.$paginator || !this.$paginated) {
            return;
        }

        if(this.$total !== this.$paginator.getTotal()) {
            this.$paginator.setTotal(this.$total);
            return;
        }

        if(!_.isUndefined(data.page) && !_.isEqual(data.page, this.$page)) {
            // from paginator
            this.$paginated.setPage(data.page);
            this.$page = data.page;
        }
        else if(!_.isUndefined(data.total) && !_.isEqual(data.total, this.$total)) {
            // from paginated
            this.$paginator.setTotal(data.total);
            this.$total = data.total;
        }
    }

    getChildContext(context) {
        return _.assign({}, super.getChildContext(context), {
            registerPaginator: this.registerPaginator.bind(this),
            unregisterPaginator: this.unregisterPaginator.bind(this),
            registerPaginated: this.registerPaginated.bind(this),
            unregisterPaginated: this.unregisterPaginated.bind(this),
            doPagination: this.doPagination.bind(this),
        });
    }

    render(props, state) {
        const [{
            className,
            children,
        }, rest] = this.getPropValues();

        return (
            <div className={ className } data-type={ this.getTypeName() } { ...rest }>
                { children }
            </div>
        );
    }
}

Pagination.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    children: PropTypes.isChildren('children'),
};

Pagination.propTypesRest = true;
Pagination.displayName = "Pagination";
