import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Utils from '../utils/utils';

export default class ButtonIcon extends BaseComponent {
    constructor() {
        super();
    }

    onClick(e) {
        const form = this.getForm();

        if(this.prop('type') === 'submit') {
            Utils.delay(() => {
                if(form) {
                    const msg = form.validate();
                    if(!_.isEmpty(msg)) {
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

    getIconUrl() {
        const iconName = this.prop('iconName');
        if(iconName.startsWith('http://') || iconName.startsWith('https://')) {
            return iconName;
        }
        else {
            return Utils.getResource(iconName);
        }
    }

    render(props, state) {
        const [{
            className,
            iconName,
            iconClass,
            variant,
            size,
            disabled,
            alternativeText,
            type,
            onClick,
            iconWidth,
            iconHeight,
            children,
        }, rest] = this.getPropValues();

        return (
            <button className={ window.$Utils.classnames(
                'slds-button',
                {
                    'slds-button--icon-small': size === 'small' && variant !== 'custom',
                    'slds-button--icon-x-small': size === 'x-small' && variant !== 'custom',
                    'slds-button--icon-xx-small': size === 'xx-small' && variant !== 'custom',
                },
                {
                    'slds-button--icon-bare': variant === 'bare' && variant !== 'custom',
                    'slds-button--icon-container': variant === 'container' && variant !== 'custom',
                    'slds-button--icon-border': variant === 'border' && variant !== 'custom',
                    'slds-button--icon-border-filled': variant === 'border-filled' && variant !== 'custom',
                    'slds-button--icon-border-inverse': variant === 'border-inverse' && variant !== 'custom',
                    'slds-button--icon-inverse': variant === 'inverse' && variant !== 'custom',
                },
                className
                ) } type={ type } disabled={ disabled } title={ alternativeText } onClick={ e => this.onClick(e) } data-type={ this.getTypeName() } { ...rest }>
                {
                    variant !== 'custom' ?
                    <PrimitiveIcon variant="bare" iconName={ iconName } className={ window.$Utils.classnames(
                        'slds-button__icon',
                        {
                            'slds-button--icon--inverse': variant === 'inverse' || variant === 'border-inverse',
                            'slds-button__icon--large': size === 'large' && variant !== 'custom',
                            'slds-button__icon--small': size === 'small' && variant !== 'custom',
                            'slds-button__icon--x-small': size === 'x-small' && variant !== 'custom',
                        },
                        iconClass,
                    ) }/>
                    :
                    <img alt={ alternativeText } src={ this.getIconUrl() } style={ { width: `${iconWidth}px`, height: `${iconHeight}px` } }></img>
                }
                <span className="slds-assistive-text">
                    { alternativeText }
                </span>
                { children }
            </button>
        );
    }
}

ButtonIcon.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    iconName: PropTypes.isIcon('iconName').required().demoValue('ctc-utility:info_info'),
    iconClass: PropTypes.isString('iconClass').demoValue(''),
    variant: PropTypes.isString('variant').values([
        "custom",
        "bare",
        "container",
        "border",
        "border-filled",
        "border-inverse",
        "inverse",
    ]).defaultValue('border').demoValue('border'),
    size: PropTypes.isString('size').values([
        "large",
        "medium",
        "small",
        "x-small",
        "xx-small",
    ]).defaultValue('small').demoValue('small'),
    iconWidth: PropTypes.isNumber('iconWidth').demoValue(24).defaultValue(24),
    iconHeight: PropTypes.isNumber('iconHeight').demoValue(24).defaultValue(24),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    alternativeText: PropTypes.isString('alternativeText').demoValue(''),
    type: PropTypes.isString('type').values([
        'button',
        'submit',
    ]).defaultValue('button').demoValue('button'),
    onClick: PropTypes.isFunction('onClick'),
    children: PropTypes.isChildren('children'),
};

ButtonIcon.propTypesRest = true;
ButtonIcon.displayName = "ButtonIcon";
