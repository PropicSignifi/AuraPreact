import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import Input from '../input/input';
import applyOptionConstraints from '../utils/optionConstraints';

export default class CheckboxGroup extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            disabled: [],
        });
    }

    onValueChange(newVal, index) {
        const option = this.prop("options")[index];
        if(option) {
            const optionConstraints = this.prop('optionConstraints');
            const result = applyOptionConstraints(this.prop('value'), option.value, optionConstraints);
            this.setState({
                disabled: result.disabled,
            }, () => {
                this.setValue(result.selected);
            });
        }
    }

    validate(newVal) {
        if(this.prop('required') && _.isEmpty(newVal)) {
            return `'${this.prop("label")}' is required`;
        }

        return super.validate(newVal);
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
                { ...rest }>
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
                    style === 'button' ?
                    <div className="slds-form-element__control slds-grow">
                        <div className="slds-checkbox_button-group">
                            { _.map(options, (option, index) => <Input type="checkbox-group-item" label={ option.label } name={ `option-${index}` } disabled={ isDisabled } readonly={ isReadonly } value={ _.includes(value, option.value) } onValueChange={ newVal => this.onValueChange(newVal, index) }></Input>) }
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
                        ) } label={ option.label } name={ `option-${index}` } disabled={ isDisabled || option.isDisabled } readonly={ isReadonly } value={ _.includes(value, option.value) } onValueChange={ newVal => this.onValueChange(newVal, index) }></Input>) }
                    </div>
                }
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

CheckboxGroup.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isObject('value').defaultValue([]),
    optionClass: PropTypes.isString('optionClass').demoValue(''),
    options: PropTypes.isArray('options').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value').required(),
    }),
    type: PropTypes.isString('type').values([
        "checkbox",
        "checkbox-big",
        "checkbox-medium",
        "checkbox-small",
    ]).defaultValue('checkbox').demoValue('checkbox'),
    style: PropTypes.isString('style').values([
        "vertical",
        "horizontal",
        "button",
    ]).defaultValue('vertical').demoValue('vertical'),
    numOfCols: PropTypes.isNumber('numOfCols').demoValue(2).defaultValue(2),
    optionConstraints: PropTypes.isArray('optionConstraints').defaultValue([]),
});

CheckboxGroup.propTypes.name.demoValue('checkboxGroup');
CheckboxGroup.propTypes.label.demoValue('Checkbox Group');

CheckboxGroup.propTypesRest = true;
CheckboxGroup.displayName = "CheckboxGroup";
