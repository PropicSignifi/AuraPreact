import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import ButtonIcon from '../buttonIcon/buttonIcon';

export default class Pill extends BaseComponent {
    constructor() {
        super();
    }

    onRemove(e) {
        if(this.prop('disabled')) {
            return;
        }

        if(_.isFunction(this.prop("onRemove"))) {
            this.prop("onRemove")(e);
        }
    }

    onClick(e) {
        if(this.prop('disabled')) {
            return;
        }

        if(_.isFunction(this.prop("onClick"))) {
            this.prop("onClick")(e);
        }
    }

    renderLabel() {
        const label = this.prop('label');
        const isHtml = this.prop('isHtml');
        if(isHtml) {
            return (
                <span className="slds-pill__label" dangerouslySetInnerHTML={ { __html: label } }></span>
            );
        }
        else {
            return (
                <span className="slds-pill__label">{ label }</span>
            );
        }
    }

    render(props, state) {
        const [{
            className,
            name,
            label,
            disabled,
            onRemove,
            onClick,
        }, rest] = this.getPropValues();

        return (
            <span
                className={ window.$Utils.classnames('slds-pill',
                {
                    ['slds-pill_link']: !disabled,
                },
                className) }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                {
                    !disabled ?
                    <a className="slds-pill__action" title={ label } onClick={ e => this.onClick(e) }>
                        { this.renderLabel() }
                    </a>
                    :
                    this.renderLabel()
                }
                {
                    !disabled && (
                    <ButtonIcon variant="bare" iconName="utility:close" className="slds-pill__remove" alternativeText="Remove" onClick={ e => this.onRemove(e) }></ButtonIcon>
                    )
                }
            </span>
        );
    }
}

Pill.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    name: PropTypes.isString('name').demoValue('name'),
    label: PropTypes.isString('label').required().demoValue('label'),
    disabled: PropTypes.isBoolean('disabled').demoValue(false).defaultValue(false),
    onRemove: PropTypes.isFunction('onRemove'),
    onClick: PropTypes.isFunction('onClick'),
    isHtml: PropTypes.isBoolean('isHtml').defaultValue(false).demoValue(false),
};

Pill.propTypesRest = true;
Pill.displayName = "Pill";
