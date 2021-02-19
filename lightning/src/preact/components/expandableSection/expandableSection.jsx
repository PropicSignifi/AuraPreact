import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Helptext from '../helptext/helptext';

export default class ExpandableSection extends BaseComponent {
    constructor() {
        super();

        this.state = {
            expanded: null,
        };
    }

    onToggle(e) {
        if(_.isFunction(this.prop("onClick"))) {
            this.prop("onClick")(this.prop("expanded"));
        }
        if(!_.isBoolean(this.prop("expanded"))) {
            this.setState({
                expanded: !this.getExpanded(),
            });
        }
    }

    getExpanded() {
        const initialExpanded = this.prop('initialExpanded');
        return this.state.expanded === null ? initialExpanded : this.state.expanded;
    }

    render(props, state) {
        const [{
            className,
            title,
            tooltip,
            expandable,
            expanded,
            onClick,
            children,
        }, rest] = this.getPropValues();
        const isExpanded = _.isBoolean(expanded) ? expanded : this.getExpanded();

        return (
            <div className={ window.$Utils.classnames(
                'slds-section',
                {
                    'slds-is-open': isExpanded,
                },
                className
            ) } data-type={ this.getTypeName() } { ...rest }>
                {
                    expandable ?
                    <h3 className="slds-section__title">
                        <button aria-expanded={ expanded } className="slds-button slds-section__title-action" onclick={ e => this.onToggle(e) }>
                            <PrimitiveIcon variant="bare" iconName="utility:switch" className="slds-section__title-action-icon slds-button__icon slds-button__icon_left"/>
                            <span className="slds-truncate" title={ title }>{ title }</span>
                            { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"/> : null }
                        </button>
                    </h3>
                    :
                    <h3 className="slds-section__title slds-theme_shade slds-size_1-of-1">
                        <span className="slds-truncate slds-p-horizontal_small" title={ title }>{ title }</span>
                        { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"/> : null }
                    </h3>
                }
                <div aria-hidden="false" className="slds-section__content">
                    { children }
                </div>
            </div>
        );
    }
}

ExpandableSection.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    title: PropTypes.isString('title').required().demoValue('Title'),
    tooltip: PropTypes.isString('tooltip').demoValue(''),
    expandable: PropTypes.isBoolean('expandable').defaultValue(true).demoValue(true),
    expanded: PropTypes.isBoolean('expanded').demoValue(true),
    initialExpanded: PropTypes.isBoolean('initialExpanded').demoValue(true),
    onClick: PropTypes.isFunction('onClick'),
    children: PropTypes.isChildren('children'),
};

ExpandableSection.propTypesRest = true;
ExpandableSection.displayName = "ExpandableSection";
