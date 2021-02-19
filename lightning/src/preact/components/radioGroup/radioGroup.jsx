import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import Input from '../input/input';

export default class RadioGroup extends AbstractField {
    constructor() {
        super();
    }

    onValueChange(newVal, index) {
        const option = this.prop("options")[index];
        if(option) {
            this.setValue(option.value);
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
            options,
            type,
            style,
            optionClass,
            onValueChange,
            numOfCols,
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
                className
                ) }
                data-anchor={ this.getDataAnchor() }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                {
                    variant !== 'label-removed' ?
                    <label className={ window.$Utils.classnames(
                        {
                            'slds-form-element__legend': style === 'button',
                            'slds-form-element__label': true,
                        }
                        ) } htmlFor={ id }>
                        <span className={ variant === 'label-hidden' ? 'slds-assistive-text' : '' }>
                            { label }
                        </span>
                        { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                        { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"></Helptext> : null }
                    </label>
                    : null
                }
                {
                    style === 'button' || style === 'primary' || style === 'select' ?
                    <div className="slds-form-element__control slds-grow slds-radioGroup">
                        <div className={ `slds-radio_button-group slds-radio_button-group-${style}` }>
                            { _.map(options, (option, index) => <Input type="radio-group-item" label={ option.label } name={ `${id}-option-${index}` } disabled={ isDisabled } readonly={ isReadonly } value={ option.value === value } onValueChange={ newVal => this.onValueChange(newVal, index) }></Input>) }
                        </div>
                    </div>
                    :
                    <div className={ window.$Utils.classnames(
                        'slds-form-element__control slds-grow',
                        {
                            'slds-grid slds-wrap': style === 'horizontal',
                        }
                        ) }>
                        { _.map(options, (option, index) => <Input type={ type } className={ window.$Utils.classnames(
                            {
                                [`slds-col slds-size_1-of-${numOfCols}`]: style === 'horizontal',
                            },
                            optionClass,
                            ) } label={ option.label } name={ `${id}-option-${index}` } disabled={ isDisabled } readonly={ isReadonly } value={ option.value === value } onValueChange={ newVal => this.onValueChange(newVal, index) }></Input>) }
                    </div>
                }
            </div>
        );
    }
}

RadioGroup.propTypes = PropTypes.extend(AbstractField.propTypes, {
    optionClass: PropTypes.isString('optionClass').demoValue(''),
    options: PropTypes.isArray('options').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value').required(),
    }),
    type: PropTypes.isString('type').values([
        "radio",
        "radio-big",
        "radio-medium",
        "radio-small",
    ]).defaultValue('radio').demoValue('radio'),
    style: PropTypes.isString('style').values([
        "vertical",
        "horizontal",
        "button",
        "primary",
        "select",
    ]).defaultValue('vertical').demoValue('vertical'),
    numOfCols: PropTypes.isNumber('numOfCols').demoValue(2).defaultValue(2),
});

RadioGroup.propTypes.name.demoValue('radioGroup');
RadioGroup.propTypes.label.demoValue('Radio Group');

RadioGroup.propTypesRest = true;
RadioGroup.displayName = "RadioGroup";
