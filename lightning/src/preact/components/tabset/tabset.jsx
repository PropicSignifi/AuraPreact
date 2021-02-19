import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import ButtonMenu from '../menu/buttonMenu';
import MenuItem from '../menu/menuItem';
import { PrimitiveIcon } from '../icon/icon';
import styles from './styles.css';

export default class Tabset extends BaseComponent {
    constructor() {
        super();

        this.state = {
            selectedTabId: null,
        };

        this.bind([
            'onSelectMoreTab',
        ]);
    }

    onSelectMoreTab(actionName) {
        this.setSelectedTabId(actionName);
    }

    onClickTab(e, tab) {
        if(tab.attributes.disabled) {
            return;
        }
        this.setSelectedTabId(tab.attributes.id);
    }

    setSelectedTabId(id) {
        if(_.isNull(this.prop("selectedTabId")) || _.isUndefined(this.prop("selectedTabId"))) {
            this.setState({
                selectedTabId: id,
            });
        }

        if(_.isFunction(this.prop("onSelect"))) {
            this.prop("onSelect")(id);
        }
    }

    getSelectedTabId() {
        return (_.isNull(this.prop("selectedTabId")) || _.isUndefined(this.prop("selectedTabId"))) ?
            this.state.selectedTabId :
            this.prop("selectedTabId");
    }

    render(props, state) {
        const [{
            className,
            variant,
            selectedTabId,
            onSelect,
            maxTabs,
            children,
        }, rest] = this.getPropValues();

        const allTabs = _.compact(children);
        let tabs = allTabs;
        let moreTabs = [];

        if(maxTabs) {
            tabs = _.take(allTabs, maxTabs);

            const selectedTab = _.find(allTabs, tab => tab.attributes.id === selectedTabId);
            if(selectedTab) {
                if(!_.includes(tabs, selectedTab)) {
                    tabs[tabs.length - 1] = selectedTab;
                }
            }

            moreTabs = _.filter(allTabs, tab => !_.includes(tabs, tab));
        }

        return (
            <div className={ window.$Utils.classnames(
                {
                    'slds-tabs--default': variant === 'base',
                    'slds-tabs--scoped': variant === 'scoped',
                    'slds-tabs--smart': variant === 'smart',
                },
                className
                ) } data-type={ this.getTypeName() } { ...rest }>
                <ul className={ window.$Utils.classnames(
                    {
                        'slds-tabs--default__nav': variant === 'base',
                        'slds-tabs--scoped__nav': variant === 'scoped',
                    },
                    styles.tabItems
                    ) } role="tablist">
                    {
                        _.map(tabs, (tab, index) => {
                            return (
                                <li key={ tab.attributes.id } className={ window.$Utils.classnames(
                                    {
                                        'slds-tabs--default__item': variant === 'base',
                                        'slds-tabs--scoped__item': variant === 'scoped',
                                        'slds-tabs--smart__item': variant === 'smart',
                                        'slds-is-active': this.getSelectedTabId() === tab.attributes.id,
                                        'slds-is-not-allowed': tab.attributes.disabled,
                                    },
                                    tab.attributes.className
                                    ) } title={ tab.attributes.label } role="presentation">
                                    <a className={ window.$Utils.classnames(
                                        {
                                            'slds-tabs--default__link': variant === 'base',
                                            'slds-tabs--scoped__link': variant === 'scoped',
                                            'slds-tabs--smart__link': variant === 'smart',
                                        },
                                        {
                                            [styles.tabLabel]: variant !== 'smart',
                                        }
                                        ) } role="tab" tabindex="0" aria-selected={ this.getSelectedTabId() === tab.attributes.id } aria-controls={ `tab-${index}` } id={ `tab-label-${index}` } onClick={ e => this.onClickTab(e, tab) }>
                                        {
                                            variant !== 'smart' && tab.attributes.iconName ?
                                            <PrimitiveIcon variant="bare" iconName={ tab.attributes.iconName } size="x-small" className="slds-m-right_xx-small"></PrimitiveIcon>
                                            : null
                                        }
                                        {
                                            variant === 'smart' && [
                                                <svg viewBox="0 0 80 60" preserveAspectRatio="none"><path d="M80,60C34,53.5,64.417,0,0,0v60H80z"></path></svg>,
                                                index > 0 && index < _.size(tabs) - 1 && (
                                                    <svg viewBox="0 0 80 60" preserveAspectRatio="none"><path d="M80,60C34,53.5,64.417,0,0,0v60H80z"></path></svg>
                                                ),
                                            ]
                                        }
                                        {
                                            variant === 'smart' ?
                                            <span>{ tab.attributes.label }</span>
                                            :
                                            <div className={ `slds-m-top_xxx-small ${styles.labelText}` }>
                                                { tab.attributes.label }
                                            </div>
                                        }
                                        {
                                            variant !== 'smart' && tab.attributes.tooltip ?
                                            <Helptext content={ tab.attributes.tooltip } className="slds-m-left_xx-small"></Helptext>
                                            : null
                                        }
                                    </a>
                                </li>
                            );
                        })
                    }
                    {
                        !_.isEmpty(moreTabs) && (variant === 'base' || variant === 'scoped') && (
                        <li
                            className={ window.$Utils.classnames(
                                {
                                    'slds-tabs--default__item slds-tabs_default__overflow-button': variant === 'base',
                                    'slds-tabs--scoped__item slds-tabs_scoped__overflow-button': variant === 'scoped',
                                }
                            ) }
                            title="More Tabs"
                            role="presentation"
                        >
                            <ButtonMenu
                                className={ styles.moreTabsButton }
                                variant="border"
                                label="More"
                                menuAlignment="right"
                                iconName="ctc-utility:a_down"
                                iconSize="x-small"
                                name="buttonMenu"
                                value="value"
                                onSelect={ this.onSelectMoreTab }
                            >
                                {
                                    _.map(moreTabs, tab => {
                                        return (
                                        <MenuItem
                                            label={ tab.attributes.label }
                                            value={ tab.attributes.id }
                                            disabled={ tab.attributes.disabled }
                                        >
                                        </MenuItem>
                                        );
                                    })
                                }
                            </ButtonMenu>
                        </li>
                        )
                    }
                </ul>
                {
                    _.map(allTabs, (tab, index) => {
                        return (
                            <div key={ `tab-${tab.attributes.id}` } id={ `tab-${index}` } className={ window.$Utils.classnames(
                                {
                                    'slds-tabs--default__content': variant === 'base',
                                    'slds-tabs--scoped__content': variant === 'scoped',
                                    'slds-show': this.getSelectedTabId() === tab.attributes.id,
                                    'slds-hide': this.getSelectedTabId() !== tab.attributes.id,
                                }
                                ) } role="tabpanel" aria-labelledby={ `tab-label-${index}` }>
                                { tab.children }
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

Tabset.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'base',
        'scoped',
        'smart',
    ]).defaultValue('scoped').demoValue('scoped'),
    selectedTabId: PropTypes.isString('selectedTabId').demoValue('tab1'),
    onSelect: PropTypes.isFunction('onSelect'),
    maxTabs: PropTypes.isNumber('maxTabs'),
    children: PropTypes.isChildren('children'),
};

Tabset.propTypesRest = true;
Tabset.displayName = "Tabset";
