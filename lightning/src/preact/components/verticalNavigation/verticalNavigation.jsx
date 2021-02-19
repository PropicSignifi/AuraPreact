import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import styles from './styles.less';

export default class VerticalNavigation extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            expanded: [],
        });

        this.bind([
            'renderChild',
            'renderSection',
            'renderOverflow',
            'renderItem',
        ]);
    }

    findFirstItem() {
        return _.chain(this.props.children)
            .filter(child => child.nodeName.displayName === 'VerticalNavigationSection')
            .flatMap('children')
            .first()
            .value();
    }

    findItemById(id) {
        return _.chain(this.props.children)
            .filter(child => child.nodeName.displayName === 'VerticalNavigationSection' || child.nodeName.displayName === 'VerticalNavigationOverflow')
            .flatMap('children')
            .find(c => c.attributes.id === id)
            .value();
    }

    getSelectedId() {
        if(this.prop('selectedItemId')) {
            return this.prop('selectedItemId');
        }
        else {
            const firstItem = this.findFirstItem();
            if(firstItem) {
                return firstItem.attributes.id;
            }
        }
    }

    onSelect(child) {
        if(_.isFunction(this.prop('onSelect'))) {
            this.prop('onSelect')(child.attributes.id);
        }
    }

    isExpanded(child) {
        return _.includes(this.state.expanded, child.attributes.id);
    }

    onExpand(child) {
        if(this.isExpanded(child)) {
            this.setState({
                expanded: _.without(this.state.expanded, child.attributes.id),
            });
        }
        else {
            this.setState({
                expanded: [
                    ...(this.state.expanded || []),
                    child.attributes.id,
                ],
            });
        }
    }

    renderSection(child) {
        return (
            <div
                key={ child.attributes.label }
                className={ `slds-nav-vertical__section ${child.attributes.className}` }
            >
                <h2 className="slds-nav-vertical__title">{ child.attributes.label }</h2>
                <ul>
                    {
                        _.map(child.children, this.renderItem)
                    }
                </ul>
            </div>
        );
    }

    getOverflowLabel(child) {
        let label = null;

        if(this.isExpanded(child)) {
            label = child.attributes.labelWhenExpanded;
        }
        else {
            label = child.attributes.labelWhenCollapsed;
        }

        if(!label) {
            label = child.attributes.label;
        }

        return label;
    }

    renderOverflow(child) {
        return (
            <div
                key={ child.attributes.id }
                className={ `slds-nav-vertical__overflow ${child.attributes.className}` }
            >
                <button
                    className="slds-button slds-button_reset slds-nav-vertical__action slds-nav-vertical__action_overflow"
                    aria-expanded={ this.isExpanded(child) }
                    onClick={ () => this.onExpand(child) }
                >
                    <PrimitiveIcon
                        variant="bare"
                        className="slds-button__icon slds-button__icon_left"
                        iconName="utility:chevronright"
                    >
                    </PrimitiveIcon>
                    <span className="slds-nav-vertical__action-text">
                        { this.getOverflowLabel(child) }
                    </span>
                </button>
                <div className={ this.isExpanded(child) ? 'slds-show' : 'slds-hide' }>
                    <ul>
                        {
                            _.map(child.children, this.renderItem)
                        }
                    </ul>
                </div>
            </div>
        );
    }

    renderItem(child) {
        return (
            <li
                key={ child.attributes.id }
                className={ window.$Utils.classnames(
                "slds-nav-vertical__item",
                {
                    'slds-is-active': child.attributes.id === this.getSelectedId(),
                },
                child.attributes.className
                ) }
                onClick={ () => this.onSelect(child) }
            >
                <a href="javascript:void(0);" className="slds-nav-vertical__action">
                    {
                        child.attributes.iconName && (
                        <span className="slds-icon_container slds-line-height_reset" title={ child.attributes.label }>
                            <PrimitiveIcon
                                variant="bare"
                                className="slds-icon slds-icon-text-default slds-icon_x-small slds-m-right_x-small"
                                iconName={ child.attributes.iconName }
                            >
                            </PrimitiveIcon>
                            <span className="slds-assistive-text">{ child.attributes.label }</span>
                        </span>
                        )
                    }
                    { child.attributes.label }
                    {
                        child.attributes.notification && (
                        <span className="slds-badge slds-col_bump-left">
                            { child.attributes.notification }
                        </span>
                        )
                    }
                </a>
            </li>
        );
    }

    renderChild(child) {
        if(child.nodeName.displayName === 'VerticalNavigationSection') {
            return this.renderSection(child);
        }
        else if(child.nodeName.displayName === 'VerticalNavigationOverflow') {
            return this.renderOverflow(child);
        }
        else if(child.nodeName.displayName === 'VerticalNavigationItem') {
            return this.renderItem(child);
        }
    }

    render(props, state) {
        const [{
            className,
            children,
        }, rest] = this.getPropValues();

        const selectedId = this.getSelectedId();
        const selected = this.findItemById(selectedId);

        return (
            <div className={ window.$Utils.classnames(
                'slds-grid',
                className
                ) } data-type={ this.getTypeName() }>
                <nav className={ `slds-nav-vertical ${styles.navigation}` } { ...rest }>
                    {
                        _.map(children, this.renderChild)
                    }
                </nav>
                <div className="slds-col slds-m-left_small">
                    {
                        selected && selected.children
                    }
                </div>
            </div>
        );
    }
}

VerticalNavigation.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    selectedItemId: PropTypes.isString('selectedItemId'),
    onSelect: PropTypes.isFunction('onSelect'),
    enableQuickFind: PropTypes.isBoolean('enableQuickFind').defaultValue(false).demoValue(false),
    children: PropTypes.isChildren('children'),
};

VerticalNavigation.propTypesRest = true;
VerticalNavigation.displayName = "VerticalNavigation";
