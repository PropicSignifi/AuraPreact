import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class FormattedText extends BaseComponent {
    constructor() {
        super();
    }

    getFormattedValue(type, value, options) {
        return window.$Formatter.format(type, value, options);
    }

    render(props, state) {
        const [{
            className,
            type,
            value,
            options,
        }, rest] = this.getPropValues();

        return (
            <span className={ className } data-type={ this.getTypeName() } { ...rest }>
                { this.getFormattedValue(type, value, options) }
            </span>
        );
    }
}

FormattedText.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    type: PropTypes.isString('type').demoValue('BSB').values(() => {
        return _.sortBy(window.$Formatter.getFormatterNames());
    }),
    value: PropTypes.isString('value').demoValue('123456'),
    options: PropTypes.isObject('options'),
};

FormattedText.propTypesRest = true;
FormattedText.displayName = "FormattedText";
