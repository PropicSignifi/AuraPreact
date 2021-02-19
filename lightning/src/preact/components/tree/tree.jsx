import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import styles from './styles.less';

export default class Tree extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            expanded: [],
            selected: null,
        });
    }

    getSelected() {
        if(this.state.selected !== null) {
            return this.state.selected;
        }
        else {
            return this.prop('selected');
        }
    }

    onClickTreeItem(item) {
        if(_.isFunction(this.prop('onSelect'))) {
            this.prop('onSelect')(item);
        }
        else {
            const key = item[this.prop('keyField')];
            this.setState({
                selected: key,
            });
        }
    }

    onExpandTreeItem(item, e) {
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

        e.stopPropagation();
    }

    renderTreeItem(item, level) {
        const key = item[this.prop('keyField')];
        const children = item[this.prop('childrenField')];
        const hasChildren = !_.isEmpty(children);
        const expanded = _.includes(this.state.expanded, key);
        const selected = (this.getSelected() === key);

        return (
            <li
                role="treeitem"
                aria-level={ level }
                aria-expanded={ expanded }
                aria-selected={ selected }
            >
                <div
                    className="slds-tree__item"
                    onClick={ this.onClickTreeItem.bind(this, item) }
                    onDblClick={ this.onExpandTreeItem.bind(this, item) }
                >
                    <button
                        className={ window.$Utils.classnames(
                        "slds-button slds-button_icon slds-m-right_x-small",
                        {
                            'slds-is-disabled': !hasChildren,
                        }
                        ) }
                        aria-hidden="true"
                        tabindex="-1"
                        title="Expand Tree Item"
                        onClick={ this.onExpandTreeItem.bind(this, item) }
                    >
                        <PrimitiveIcon
                            variant="bare"
                            className="slds-button__icon slds-button__icon_small"
                            iconName="utility:chevronright"
                        >
                        </PrimitiveIcon>
                        <span className="slds-assistive-text">Expand Tree Item</span>
                    </button>
                    <span className="slds-has-flexi-truncate">
                        {
                            _.isFunction(this.prop('renderTreeItem')) ?
                            this.prop('renderTreeItem')(item, level)
                            :
                            [
                                <span className="slds-tree__item-label slds-truncate" title={ item.name }>
                                    { item.name }
                                </span>,
                                item.description && (
                                <span className="slds-tree__item-meta slds-truncate" title={ item.description }>
                                    <span className="slds-assistive-text">:</span>
                                    { item.description }
                                </span>
                                ),
                            ]
                        }
                    </span>
                </div>
                {
                    hasChildren && expanded && (
                    <ul role="group">
                        {
                            _.map(children, child => this.renderTreeItem(child, level + 1))
                        }
                    </ul>
                    )
                }
            </li>
        );
    }

    render(props, state) {
        const [{
            className,
            header,
            data,
        }, rest] = this.getPropValues();

        const id = this.id();

        return (
            <div className={ window.$Utils.classnames(
                "slds-tree_container",
                styles.tree,
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                <h4 className="slds-text-title_caps" id={ `tree-heading-${id}` }>{ header }</h4>
                <ul className="slds-tree" role="tree" aria-labelledby={ `tree-heading-${id}` }>
                    {
                        _.map(data, child => this.renderTreeItem(child, 1))
                    }
                </ul>
            </div>
        );
    }
}

Tree.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    header: PropTypes.isString('header').demoValue('Tree header'),
    data: PropTypes.isArray('data').defaultValue([]),
    keyField: PropTypes.isString('keyField').defaultValue('id').demoValue('id'),
    childrenField: PropTypes.isString('childrenField').defaultValue('items'),
    selected: PropTypes.isObject('selected'),
    onSelect: PropTypes.isFunction('onSelect'),
    renderTreeItem: PropTypes.isFunction('renderTreeItem'),
};

Tree.propTypesRest = true;
Tree.displayName = "Tree";
