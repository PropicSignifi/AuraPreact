import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Helptext from '../helptext/helptext';
import styles from './styles.css';

export default class MenuItem extends BaseComponent {
    constructor() {
        super();
    }

    onClick(e) {
        if(_.isFunction(this.prop("onClick"))) {
            this.prop("onClick")(e);
        }

        if(this.prop("disabled")) {
            return;
        }

        if(_.isFunction(this.context.onSelect)) {
            this.context.onSelect(this.prop("value") || this.prop("label"));
        }
    }

    renderIcon(iconName, iconClass, iconSize, variant) {
        if(variant === 'container') {
            return (
                <span className={ `slds-icon_container slds-m-right_x-small ${iconClass}` }>
                    <PrimitiveIcon variant="bare" size={ iconSize } iconName={ iconName } className="slds-icon-text-default"></PrimitiveIcon>
                </span>
            );
        }
        else {
            return (
                <PrimitiveIcon variant="bare" size={ iconSize } iconName={ iconName } className={ `slds-icon_x-small slds-icon-text-default slds-m-right_x-small ${iconClass}` }></PrimitiveIcon>
            );
        }
    }

    render(props, state) {
        const [{
            className,
            label,
            value,
            tooltip,
            iconName,
            iconClass,
            iconSize,
            checked,
            disabled,
            variant,
        }, rest] = this.getPropValues();

        return (
            <li className={ window.$Utils.classnames(
                'slds-dropdown__item',
                {
                    'slds-is-selected': checked,
                },
                className)
                } role="presentation" { ...rest }>
                <a aria-disabled={ disabled } role="menuitem" tabindex="0" onClick={ e => this.onClick(e) }>
                    <span className={ styles.menuItem } title={ label }>
                        {
                            checked ?
                            <PrimitiveIcon variant="bare" size="x-small" iconName="ctc-utility:a_tick" className="slds-icon_selected slds-icon-text-default slds-m-right_x-small"></PrimitiveIcon>
                            : null
                        }
                        {
                            iconName ?
                            this.renderIcon(iconName, iconClass, iconSize, variant)
                            : null
                        }
                        { label }
                        {
                            tooltip ?
                            <Helptext content={ tooltip } className="slds-icon-text-default slds-m-left_x-small"></Helptext>
                            : null
                        }
                    </span>
                </a>
            </li>
        );
    }
}

MenuItem.propTypes = {
    className: PropTypes.isString('className'),
    label: PropTypes.isString('label').required(),
    value: PropTypes.isObject('value').required(),
    tooltip: PropTypes.isString('tooltip'),
    iconName: PropTypes.isIcon('iconName'),
    iconClass: PropTypes.isString('iconClass').demoValue(''),
    iconSize: PropTypes.isString('iconSize').values([
        'x-small',
        'small',
        'large',
    ]).demoValue('x-small'),
    checked: PropTypes.isBoolean('checked'),
    disabled: PropTypes.isBoolean('disabled'),
    variant: PropTypes.isString('variant').values([
        'bare',
        'container',
    ]).defaultValue('bare').demoValue('bare'),
};

MenuItem.propTypesRest = true;
MenuItem.displayName = "MenuItem";
