import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Picklist from '../picklist/picklist';
import Input from '../input/input';
import styles from './inputPhone.less';
import Helptext from '../helptext/helptext';

export default class InputPhone extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            configurer: {
                getTotalSelectionLabel: function(selection) {
                    return selection ? "+" + selection.value : null;
                },
            },
            countryCode: null,
            number: null,
        });
    }

    getCountryLabel(value) {
        const code = this.getCountryCode(value);
        return code ? `+${code}` : null;
    }

    getCountryCode(value) {
        if(!value) {
            if(this.state.countryCode) {
                return this.state.countryCode;
            }
            const firstOption = _.first(this.prop("countries"));
            if(firstOption) {
                return firstOption.value;
            }
        }
        const [country,] = _.split(value, " ");
        return _.parseInt(country);
    }

    getNumber(value) {
        if(!value) {
            return this.state.number;
        }
        const [, ...items] = _.split(value, " ");
        return window.$Utils.isNonDesktopBrowser() ? _.join(items, "") : _.join(items, " ");
    }

    getFormatter(value) {
        const countryCode = this.getCountryCode(value);
        if(!countryCode) {
            return null;
        }
        return `phone:${countryCode}`;
    }

    setFullPhoneValue(value) {
        const formatter = window.$Formatter.getFormatter("phone");
        const number = this.getNumber(value);
        const countryCode = this.getCountryCode(value);
        const newVal = formatter.getFullValue(number, {
            args: [countryCode],
        });
        if(number && countryCode) {
            this.setValue(newVal);
        }
        else {
            this.setValue(null);
        }
    }

    isValidPhoneNumber(value, type) {
        const formatter = window.$Formatter.getFormatter("phone");
        return formatter.isValid(this.getNumber(value), {
            args: [this.getCountryCode(value), type],
        });
    }

    validate(newVal) {
        const errorMessage = super.validate(newVal);
        if(errorMessage) {
            return errorMessage;
        }

        if(!this.isValidPhoneNumber(newVal, this.prop("type"))) {
            return "Phone number is invalid";
        }
    }

    onCountryChange(newVal) {
        if(this.prop("value")) {
            this.setFullPhoneValue(`+${newVal} ${this.getNumber(this.prop("value"))}`);
        }
        else {
            const number = this.getNumber(this.prop("value"));
            if(number) {
                this.setFullPhoneValue(`+${newVal} ${number}`);
            }
            else {
                this.setState({
                    countryCode: newVal,
                });
            }
        }
    }

    onNumberChange(newVal) {
        if(this.prop("value")) {
            this.setFullPhoneValue(`${this.getCountryLabel(this.prop("value"))} ${newVal}`);
        }
        else {
            const countryCode = this.getCountryCode(this.prop("value"));
            if(countryCode) {
                this.setFullPhoneValue(`+${countryCode} ${newVal}`);
            }
            else {
                this.setState({
                    number: newVal,
                });
            }
        }
    }

    render(props, state) {
        const [{
            className,
            tooltip,
            name,
            label,
            value,
            variant,
            disabled,
            readonly,
            required,
            placeholder,
            countries,
            type,
            onValueChange,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'is-required': required,
                    'slds-has-error': state.errorMessage,
                    'slds-form--inline': variant === 'label-hidden',
                },
                'slds-inputPhone',
                className
                ) }
                data-anchor={ this.getDataAnchor() }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                {
                    variant !== 'label-removed' ?
                    <label className="slds-form-element__label slds-form-element__label-has-tooltip" htmlFor={ id }>
                        <span className={ window.$Utils.classnames(
                            {
                                'slds-assistive-text': variant === 'label-hidden',
                            }
                            ) }>
                            { label }
                        </span>
                        { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                        { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"></Helptext> : null }
                    </label>
                    : null
                }
                <div className="slds-form-element__control slds-grow slds-grid">
                    <Picklist name="country" label="Country" variant="label-removed" options={ countries } value={ this.getCountryCode(value) } disabled={ isDisabled } readonly={ isReadonly } configurer={ state.configurer } className="countryPicklist" popupClass="slds-width_min-content" onValueChange={ newVal => this.onCountryChange(newVal) }></Picklist>
                    <Input name="number" label="Number" variant="label-removed" type="formatted-number" parseToNumber="false" value={ this.getNumber(value) } placeholder={ placeholder } disabled={ isDisabled } readonly={ isReadonly } className={ window.$Utils.classnames(
                        'slds-col slds-grid numberField',
                        styles.embeddedInput,
                        {
                            'slds-has-error': state.errorMessage,
                        }
                        ) } formatter={ this.getFormatter(value) } onValueChange={ newVal => this.onNumberChange(newVal) } { ...rest }></Input>
                </div>
                {
                    state.errorMessage ?
                    <div className="slds-form-element__help" aria-live="assertive">
                        { state.errorMessage }
                    </div>
                    : null
                }
            </div>
        );
    }
}

InputPhone.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isString('value'),
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    countries: PropTypes.isArray('countries').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isNumber('value').required(),
    }),
    type: PropTypes.isString('type').values([
        '',
        'mobile',
        'fixed_line',
    ]).defaultValue('').demoValue(''),
});

InputPhone.propTypes.name.demoValue('inputPhone');
InputPhone.propTypes.label.demoValue('Input Phone');

InputPhone.propTypesRest = true;
InputPhone.displayName = "InputPhone";
