import { h, render, Component } from 'preact';
import AbstractProxyField from '../field/proxyField';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';

export default class InputPercent extends AbstractProxyField {
    constructor() {
        super();
    }

    render(props, state) {
        const {
            min,
            max,
            addonAfter,
            ...rest,
        } = props;

        const _min = min || 0;
        const _max = max || 100;
        const _addonAfter = addonAfter || '%';

        return (
            <Input
                ref={ node => this.setField(node) }
                type="number"
                min={ _min }
                max={ _max }
                addonAfter={ _addonAfter }
                data-type={ this.getTypeName() }
                { ...rest }
            >
            </Input>
        );
    }
}

InputPercent.propTypes = PropTypes.extend(Input.propTypes, {
    value: PropTypes.isNumber('value'),
});

InputPercent.propTypes.name.demoValue('inputPercent');
InputPercent.propTypes.label.demoValue('Input Percent');

InputPercent.propTypesRest = true;
InputPercent.displayName = "InputPercent";
