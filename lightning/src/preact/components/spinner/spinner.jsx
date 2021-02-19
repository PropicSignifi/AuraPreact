import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Spinner extends BaseComponent {
    constructor() {
        super();
    }

    getSpinner(variant, size, timing, alternativeText, container, className) {
        return (
            <div role="status" className={ window.$Utils.classnames(
                'slds-spinner',
                {
                    'slds-spinner_brand': variant === 'brand',
                    'slds-spinner_inverse': variant === 'inverse',
                    'slds-spinner_xx-small': size === 'xx-small',
                    'slds-spinner_x-small': size === 'x-small',
                    'slds-spinner_small': size === 'small',
                    'slds-spinner_medium': size === 'medium',
                    'slds-spinner_large': size === 'large',
                    'slds-spinner_delayed': timing === 'delayed',
                    [className]: container === 'without',
                }
                ) } data-type={ this.getTypeName() }>
                <span className="slds-assistive-text">{ alternativeText }</span>
                <div className="slds-spinner__dot-a"></div>
                <div className="slds-spinner__dot-b"></div>
            </div>
        );
    }

    render(props, state) {
        const [{
            className,
            variant,
            size,
            timing,
            container,
            alternativeText,
            text,
            visible,
        }, rest] = this.getPropValues();

        if(!visible) {
            return null;
        }

        if(container === "with" || container === "with_fixed") {
            return (
                <div className={ window.$Utils.classnames(
                    'slds-spinner_container',
                    {
                        'slds-is-fixed': container === 'with_fixed',
                    },
                    className
                    ) } data-type={ this.getTypeName() } { ...rest }>
                    {
                        text ?
                        <div className="slds-spinner_custom-wrapper">
                            <div className="slds-spinner_custom-container">
                                { this.getSpinner(variant, size, timing, alternativeText, container, className) }
                            </div>
                            <div className={ 'slds-m-left_' + size }>
                                { text }
                            </div>
                        </div>
                        :
                        this.getSpinner(variant, size, timing, alternativeText, container, className)
                    }
                </div>
            );
        }
        else {
            return (
                text ?
                <div className="slds-spinner_custom-wrapper" data-type={ this.getTypeName() }>
                    <div className="slds-spinner_custom-container">
                        { this.getSpinner(variant, size, timing, alternativeText, container, className) }
                    </div>
                    <div className={ 'slds-m-left_' + size }>
                        { text }
                    </div>
                </div>
                :
                this.getSpinner(variant, size, timing, alternativeText, container, className)
            );
        }
    }
}

Spinner.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        "brand",
        "inverse",
    ]).defaultValue('brand').demoValue('brand'),
    size: PropTypes.isString('size').values([
        "xx-small",
        "x-small",
        "small",
        "medium",
        "large",
    ]).defaultValue('medium').demoValue('medium'),
    timing: PropTypes.isString('timing').values([
        '',
        'delayed',
    ]).defaultValue('').demoValue(''),
    container: PropTypes.isString('container').values([
        "without",
        "with",
        "with_fixed",
    ]).defaultValue('with').demoValue('with'),
    alternativeText: PropTypes.isString('alternativeText').demoValue(''),
    text: PropTypes.isString('text').demoValue(''),
    visible: PropTypes.isBoolean('visible').defaultValue(true).demoValue(true),
};

Spinner.propTypesRest = true;
Spinner.displayName = "Spinner";
