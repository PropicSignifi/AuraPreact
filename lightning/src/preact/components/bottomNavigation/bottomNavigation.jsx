import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Portal from 'preact-portal';
import styles from './styles.less';

export default class BottomNavigation extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            showAllActions: false,
        });

        this.bind([
            'onClose',
        ]);
    }

    onSelect(child) {
        if(child === 'show_more') {
            this.setState({
                showAllActions: true,
            });
        }
        else if(_.isFunction(this.prop('onSelect'))) {
            this.setState({
                showAllActions: false,
            }, () => {
                this.prop('onSelect')(child.attributes.id);
            });
        }
    }

    onClose() {
        this.setState({
            showAllActions: false,
        });
    }

    render(props, state) {
        const [{
            className,
            selectedItemId,
            visibleItems,
            children,
        }, rest] = this.getPropValues();

        const validItems = _.compact(children);
        const items = _.slice(validItems, 0, visibleItems);
        const showMore = _.size(validItems) > visibleItems;

        return (
            <div className={ className } data-type={ this.getTypeName() } { ...rest }>
                {
                    _.map(validItems, child => {
                        return (
                        <div
                            key={ child.attributes.id }
                            className={ selectedItemId === child.attributes.id ? '' : 'slds-hide' }
                            data-type="BottomNavigationItem"
                        >
                            { child.children }
                        </div>
                        );
                    })
                }
                <Portal into="body">
                {
                    this.state.showAllActions ?
                    <div className="slds-bottom-navigation_popup">
                        <div role="listbox" className="slds-listbox slds-listbox_vertical slds-border_top">
                            <ul className="slds-listbox slds-listbox_vertical slds-dropdown_length-5" role="presentation">
                                {
                                    _.map(validItems, child => {
                                        return (
                                        <li role="presentation" className="slds-listbox__item" onClick={ () => this.onSelect(child) }>
                                            <div className={ window.$Utils.classnames(
                                                "slds-media slds-listbox__option slds-listbox__option_plain slds-media_small",
                                                {
                                                    'slds-is-selected': selectedItemId === child.attributes.id,
                                                },
                                                child.attributes.className,
                                                ) } role="option">
                                                <span className="slds-media__figure slds-listbox__option-icon"></span>
                                                <span className="slds-media__body">
                                                    <span className="slds-hyphenate">{ child.attributes.label }</span>
                                                </span>
                                            </div>
                                        </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                        <div className="slds-p-around_small slds-border_top slds-text-align_center slds-bottom-navigation_close" role="button" onClick={ this.onClose }>
                            Close
                        </div>
                    </div>
                    :
                    <div className="slds-bottom-navigation">
                        {
                            _.map(items, child => {
                                return child && (
                                <div
                                    key={ child.attributes.id }
                                    className={ window.$Utils.classnames(
                                    "slds-bottom-navigation_action",
                                    {
                                        'slds-is-selected': selectedItemId === child.attributes.id,
                                    },
                                        child.attributes.className,
                                    ) }
                                    role="button"
                                    onClick={ () => this.onSelect(child) }
                                >
                                    <span className={ `slds-icon_container slds-icon_container_circle slds-icon_bottom-navigation ${child.attributes.iconClass}` }>
                                        <PrimitiveIcon
                                            variant="bare"
                                            className="slds-icon slds-icon_xx-small"
                                            iconName={ child.attributes.iconName }
                                        >
                                        </PrimitiveIcon>
                                    </span>
                                    <div className="slds-text-title slds-hyphenate">
                                        { child.attributes.label }
                                    </div>
                                </div>
                                );
                            })
                        }
                        {
                            showMore && (
                                <div
                                    key="show_more"
                                    className={ window.$Utils.classnames(
                                    "slds-bottom-navigation_action"
                                    ) }
                                    role="button"
                                    onClick={ () => this.onSelect('show_more') }
                                >
                                    <span className={ `slds-icon_container slds-icon_container_circle slds-icon_bottom-navigation` }>
                                        <PrimitiveIcon
                                            variant="bare"
                                            className="slds-icon slds-icon_xx-small"
                                            iconName="action:more"
                                        >
                                        </PrimitiveIcon>
                                    </span>
                                    <div className="slds-text-title">
                                        More
                                    </div>
                                </div>
                            )
                        }
                    </div>
                }
                </Portal>
            </div>
        );
    }
}

BottomNavigation.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    selectedItemId: PropTypes.isString('selectedItemId'),
    onSelect: PropTypes.isFunction('onSelect'),
    visibleItems: PropTypes.isNumber('visibleItems').defaultValue(4).demoValue(4),
    children: PropTypes.isChildren('children'),
};

BottomNavigation.propTypesRest = true;
BottomNavigation.displayName = "BottomNavigation";
