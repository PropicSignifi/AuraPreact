import { h, render, Component } from 'preact';
import AbstractProxyField from '../field/proxyField';
import PropTypes from '../propTypes/propTypes';
import Input from '../input/input';

export default class InputCurrency extends AbstractProxyField {
    constructor() {
        super();
    }

    onCurrencyValueChange(newVal) {
        newVal = !_.isNil(newVal) && newVal !== '' ? _.toNumber(newVal) : newVal;
        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(newVal, this.prop('name'));
        }
    }

    render(props, state) {
        const {
            formatter,
            allowedPattern,
            addonBefore,
            step,
            onValueChange,
            allowNegative,
            ...rest,
        } = props;

        const currencyFormatter = formatter || "decimal";
        const currencyAllowedPattern = allowedPattern || (allowNegative ? '^(-)?[0-9,.]*$' : '^[0-9,.]*$' );
        const currencyAddonBefore = addonBefore || "$";
        const currencyStep = step || "1.00";

        if(allowNegative) {
            return (
                <Input
                    ref={ node => this.setField(node) }
                    type="formatted-number"
                    formatter={ currencyFormatter }
                    allowedPattern={ currencyAllowedPattern }
                    addonBefore={ currencyAddonBefore }
                    step={ currencyStep }
                    onValueChange={ this.onCurrencyValueChange.bind(this) }
                    data-type={ this.getTypeName() }
                    { ...rest }
                >
                </Input>
            );
        }
        else {
            return (
                <Input
                    ref={ node => this.setField(node) }
                    type="formatted-number"
                    min="0"
                    formatter={ currencyFormatter }
                    allowedPattern={ currencyAllowedPattern }
                    addonBefore={ currencyAddonBefore }
                    step={ currencyStep }
                    onValueChange={ this.onCurrencyValueChange.bind(this) }
                    data-type={ this.getTypeName() }
                    { ...rest }
                >
                </Input>
            );
        }
    }
}

InputCurrency.propTypes = PropTypes.extend(Input.propTypes, {
    value: PropTypes.isObject('value'),
    allowNegative: PropTypes.isBoolean('allowNegative').demoValue(false),
});

InputCurrency.propTypes.name.demoValue('inputCurrency');
InputCurrency.propTypes.label.demoValue('Input Currency');

InputCurrency.propTypesRest = true;
InputCurrency.displayName = "InputCurrency";
