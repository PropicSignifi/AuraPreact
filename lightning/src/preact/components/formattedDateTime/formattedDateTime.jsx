import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class FormattedDateTime extends BaseComponent {
    constructor() {
        super();
    }

    getFormattedValue(value, type) {
        return window.$Formatter.format("datetime", value, { type, });
    }

    render(props, state) {
        const [{
            className,
            value,
            type,
        }, rest] = this.getPropValues();
        const formattedDateTime = this.getFormattedValue(value, type);
        return (
            <span className={ className } title={ formattedDateTime } data-type={ this.getTypeName() } { ...rest }>
                { formattedDateTime }
            </span>
        );
    }
}

FormattedDateTime.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    value: PropTypes.isObject('value').demoValue(Date.now()),
    type: PropTypes.isString('type').values([
        "date",
        "time",
        "datetime",
        "datetime-short",
        "datetime-normal",
        "time-normal",
    ]).defaultValue('date').demoValue('date'),
};

FormattedDateTime.propTypesRest = true;
FormattedDateTime.displayName = "FormattedDateTime";
