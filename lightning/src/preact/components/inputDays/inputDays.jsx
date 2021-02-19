import { h, render, Component } from 'preact';
import AbstractProxyField from '../field/proxyField';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';

export default class InputDays extends AbstractProxyField {
    constructor() {
        super();
    }

    render(props, state) {
        const {
            min,
            addonAfter,
            ...rest,
        } = props;

        const _min = min || 0;
        const _addonAfter = addonAfter || 'Days';

        return (
            <Input
                ref={ node => this.setField(node) }
                type="number"
                min={ _min }
                addonAfter={ _addonAfter }
                data-type={ this.getTypeName() }
                { ...rest }
            >
            </Input>
        );
    }
}

InputDays.propTypes = PropTypes.extend(Input.propTypes, {
    value: PropTypes.isNumber('value'),
});

InputDays.propTypes.name.demoValue('inputDays');
InputDays.propTypes.label.demoValue('Input Days');

InputDays.propTypesRest = true;
InputDays.displayName = "InputDays";
