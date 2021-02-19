import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class FormattedNumber extends BaseComponent {
    constructor() {
        super();
    }

    getFormattedValue(value, options) {
        if(_.isUndefined(value) || _.isNull(value)) {
            return "";
        }

        if(options.type === "currency") {
            return value >= 0 ?
                "$" + window.$IntlLibrary.numberFormat({
                    style: "decimal",
                    minimumFractionDigits: options.minimumFractionDigits,
                    maximumFractionDigits: options.maximumFractionDigits,
                }).format(value) :
                "-$" + window.$IntlLibrary.numberFormat({
                    style: "decimal",
                    minimumFractionDigits: options.minimumFractionDigits,
                    maximumFractionDigits: options.maximumFractionDigits,
                }).format(-value);
        }
        else {
            return window.$IntlLibrary.numberFormat(options).format(value);
        }
    }

    render(props, state) {
        const [{
            className,
            value,
            type,
            style,
            currencyCode,
            currencyDisplayAs,
            minimumIntegerDigits,
            minimumFractionDigits,
            maximumFractionDigits,
            minimumSignificantDigits,
            maximumSignificantDigits,
        }, rest] = this.getPropValues();

        const options = {
            type,
            style,
            currencyCode,
            currencyDisplayAs,
            minimumIntegerDigits,
            minimumFractionDigits,
            maximumFractionDigits,
            minimumSignificantDigits,
            maximumSignificantDigits,
        };

        return (
            <span className={ className } data-type={ this.getTypeName() } { ...rest }>
                { this.getFormattedValue(value, options) }
            </span>
        );
    }
}

FormattedNumber.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    value: PropTypes.isNumber('value').demoValue(12000),
    type: PropTypes.isString('type').values([
        'currency',
    ]).defaultValue('currency').demoValue('currency'),
    style: PropTypes.isString('style'),
    currencyCode: PropTypes.isString('currencyCode'),
    currencyDisplayAs: PropTypes.isString('currencyDisplayAs'),
    minimumIntegerDigits: PropTypes.isNumber('minimumIntegerDigits'),
    minimumFractionDigits: PropTypes.isNumber('minimumFractionDigits').defaultValue(2),
    maximumFractionDigits: PropTypes.isNumber('maximumFractionDigits').defaultValue(2),
    minimumSignificantDigits: PropTypes.isNumber('minimumSignificantDigits'),
    maximumSignificantDigits: PropTypes.isNumber('maximumSignificantDigits'),
};

FormattedNumber.propTypesRest = true;
FormattedNumber.displayName = "FormattedNumber";
