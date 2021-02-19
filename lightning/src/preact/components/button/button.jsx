import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Helptext from '../helptext/helptext';
import Utils from '../utils/utils';
import styles from './styles.css';

export default class Button extends BaseComponent {
    constructor() {
        super();

        this.bind([
            'onClick',
        ]);
    }

    getIcon(iconName, className) {
        return (
            <PrimitiveIcon variant="bare" iconName={ iconName } className={ className }/>
        );
    }

    getTooltip(tooltip) {
        return tooltip ?
            (
                <Helptext content={ tooltip } className="slds-m-left_x-small"/>
            ) : null;
    }

    onClick(e) {
        const form = this.getForm();

        if(this.prop('type') === 'submit') {
            Utils.delay(() => {
                if(form) {
                    const msg = form.validate();
                    if(!_.isEmpty(msg)) {
                        if(this.prop('showValidationErrors')) {
                            Utils.popover({
                                referenceElement: document.querySelector(`[data-locator="${this.id()}"]`),
                                variant: 'error',
                                header: 'Validation Errors',
                                renderContent: () => {
                                    return (
                                        <div>
                                            {
                                                _.map(msg, message => {
                                                    return (
                                                    <p>{ message }</p>
                                                    );
                                                })
                                            }
                                        </div>
                                    );
                                },
                            });
                        }

                        return;
                    }
                }

                if(_.isFunction(this.prop("onClick"))) {
                    this.prop("onClick")(e, form);
                }
            }, 50);
        }
        else {
            if(_.isFunction(this.prop("onClick"))) {
                this.prop("onClick")(e, form);
            }
        }
    }

    render(props, state) {
        const [{
            className,
            label,
            variant,
            iconName,
            iconPosition,
            disabled,
            type,
            tooltip,
            onClick,
            children,
        }, rest] = this.getPropValues();

        return (
            <button className={ window.$Utils.classnames(
                'slds-button',
                {
                    'slds-button--neutral': variant === 'neutral',
                    'slds-button--brand': variant === 'brand',
                    'slds-button--destructive': variant === 'destructive',
                    'slds-button--inverse': variant === 'inverse',
                    'slds-button--success': variant === 'success',
                    'slds-button_primary': variant === 'primary',
                    'slds-button_secondary': variant === 'secondary',
                    'slds-button_tertiary': variant === 'tertiary',
                    'slds-button_save': variant === 'save',
                    'slds-text-link_reset': variant === 'reset',
                },
                styles.button,
                className
                ) } type={ type } disabled={ disabled } onClick={ this.onClick }
                data-anchor={ label }
                data-type={ this.getTypeName() }
                data-locator={ this.id() }
                { ...rest }
            >
                { iconName && iconPosition === 'left' ? this.getIcon(iconName, "slds-button__icon slds-button__icon--left") : null }
                { _.isEmpty(children) ? label : children }
                { iconName && iconPosition === 'right' ? this.getIcon(iconName, "slds-button__icon slds-button__icon--right") : null }
                { this.getTooltip(tooltip) }
            </button>
        );
    }
}

Button.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    label: PropTypes.isString('label').required().demoValue('Button'),
    variant: PropTypes.isString('variant').values([
        "neutral",
        "brand",
        "destructive",
        "inverse",
        "success",
        "primary",
        "secondary",
        "tertiary",
        "save",
        "reset",
    ]).defaultValue("tertiary").demoValue('primary'),
    iconName: PropTypes.isIcon('iconName').demoValue(''),
    iconPosition: PropTypes.isString('iconPosition').values([
        'left',
        'right',
    ]).defaultValue('left').demoValue('left'),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    type: PropTypes.isString('type').values([
        "button",
        "submit",
    ]).defaultValue("button").demoValue('button'),
    tooltip: PropTypes.isString('tooltip').demoValue(''),
    onClick: PropTypes.isFunction('onClick'),
    showValidationErrors: PropTypes.isBoolean('showValidationErrors').defaultValue(true),
    children: PropTypes.isChildren('children'),
};

Button.propTypesRest = true;
Button.displayName = "Button";
