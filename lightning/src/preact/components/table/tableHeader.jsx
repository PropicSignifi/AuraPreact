import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import TableConfigButton from './tableConfigButton';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Input from '../input/input';
import QuickActions from '../quickActions/quickActions';
import styles from './tableHeaderStyles.less';

export default class TableHeader extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            searchText: null,
            showSearchInput: false,
        });
    }

    showSearchInput() {
        this.setState({
            showSearchInput: true,
        });
    }

    onSearch(searchText) {
        this.setState({
            searchText,
        }, () => {
            if(_.isFunction(this.prop('onSearch'))) {
                this.prop('onSearch')(searchText);
            }
        });
    }

    isSearchable() {
        return _.isFunction(this.prop('onSearch'));
    }

    isCompactStyle() {
        return this.prop('style') === 'compact' || window.$Utils.isMobileScreenSize();
    }

    shouldShowSearchInput() {
        return this.state.showSearchInput || this.prop('style') === 'compact';
    }

    createSearchInput() {
        return this.shouldShowSearchInput() && (
            <Input
                className={ window.$Utils.classnames(
                styles.searchInput,
                {
                    'slds-m-top_x-small': this.isCompactStyle(),
                }
                ) }
                name="search"
                label="Search"
                type="search"
                placeholder="Search this list..."
                variant="label-removed"
                value={ this.state.searchText }
                onValueChange={ this.onSearch.bind(this) }
            >
            </Input>
        );
    }

    render(props, state) {
        const [{
            className,
            name,
            columns,
            children,
            actions,
            quickActions,
            onReload,
            onValueChange,
        }, rest] = this.getPropValues();

        return (
            <div
                className={ `slds-p-vertical_medium ${className}` }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                <div className={ `slds-grid slds-wrap slds-grid_vertical-align-center` }>
                    <div className="slds-text-heading_medium tableHeader">
                        { children }
                    </div>
                    <div className="slds-col_bump-left slds-grid">
                        {
                            !this.isCompactStyle() && this.isSearchable() && this.createSearchInput()
                        }
                        <div className="slds-button-group slds-m-left_xx-small">
                            {
                                this.isSearchable() && !this.shouldShowSearchInput() && (
                                <ButtonIcon
                                    variant="border-filled"
                                    iconName="ctc-utility:a_search"
                                    size="medium"
                                    alternativeText="Search"
                                    onClick={ this.showSearchInput.bind(this) }
                                >
                                </ButtonIcon>
                                )
                            }
                            { actions }
                            {
                                onValueChange && (
                                <TableConfigButton
                                    variant="border-filled"
                                    name={ name }
                                    columns={ columns }
                                    size="medium"
                                    onValueChange={ onValueChange }
                                >
                                </TableConfigButton>
                                )
                            }
                            {
                                onReload && (
                                <ButtonIcon
                                    variant="border-filled"
                                    iconName="utility:refresh"
                                    size="medium"
                                    alternativeText="Reload"
                                    onClick={ onReload }
                                >
                                </ButtonIcon>
                                )
                            }
                            {
                                !_.isEmpty(quickActions) && (
                                <QuickActions
                                    name={ `${name}-table-quickActions` }
                                    variant="dropdown"
                                    className="slds-button_last"
                                    actions={ quickActions }
                                    context={ this.prop('quickActionsContext') }
                                >
                                </QuickActions>
                                )
                            }
                        </div>
                    </div>
                </div>
                {
                    this.isCompactStyle() && this.isSearchable() && this.createSearchInput()
                }
            </div>
        );
    }
}

TableHeader.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').required(),
    columns: PropTypes.isArray('columns').required(),
    onValueChange: PropTypes.isFunction('onValueChange'),
    onReload: PropTypes.isFunction('onReload'),
    actions: PropTypes.isArray('actions'),
    quickActions: PropTypes.isArray('quickActions'),
    quickActionsContext: PropTypes.isObject('quickActionsContext'),
    onSearch: PropTypes.isFunction('onSearch'),
    style: PropTypes.isString('style').values([
        'standard',
        'compact',
    ]).defaultValue('standard').demoValue('standard'),
    children: PropTypes.isChildren('children'),
};

TableHeader.propTypesRest = true;
TableHeader.displayName = "TableHeader";
