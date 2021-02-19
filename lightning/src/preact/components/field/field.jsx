import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';

export default class AbstractField extends BaseComponent {
    constructor() {
        super();

        this.state = {
            errorMessage: null,
            disabled: false,
            readonly: false,
        };
    }

    doContextValidation(newVal) {
        if(_.isFunction(this.context.validate)) {
            this.context.validate(this.prop("name"), newVal);
        }
    }

    doValidation(newVal) {
        if(_.isFunction(this.validate)) {
            const errorMessage = this.validate(newVal);
            this.setState({
                errorMessage,
            }, () => this.doContextValidation(newVal));
        }
        else {
            this.doContextValidation(newVal);
        }
    }

    validate(newVal) {
        let validator = window.$Validator.of(this.prop("name"), this.prop("label"));
        if(this.prop("required")) {
            validator = validator.require();
        }
        if(!_.isNil(this.props.min)) {
            validator = validator.min(_.parseInt(this.prop("min")));
        }
        if(!_.isNil(this.props.max)) {
            validator = validator.max(_.parseInt(this.prop("max")));
        }
        if(!_.isNil(this.props.minlength)) {
            validator = validator.minlength(_.parseInt(this.prop("minlength")));
        }
        if(!_.isNil(this.props.maxlength)) {
            validator = validator.maxlength(_.parseInt(this.prop("maxlength")));
        }
        if(this.props.pattern) {
            if(this.prop('patternMessage')){
                validator = validator.pattern(this.prop("pattern"),this.prop('patternMessage'));
            }else{
                validator = validator.pattern(this.prop("pattern"));
            }
        }
        if(_.isFunction(this.prop('validate'))) {
            validator = validator.add(this.prop('validate'));
        }

        return validator.toValidator().validate([newVal]);
    }

    getValue() {
        return this.prop("value");
    }

    setValue(newVal) {
        if(this.prop("value") === newVal) {
            return;
        }

        if(_.isFunction(this.prop("onValueChange"))) {
            this.prop("onValueChange")(newVal, this.prop("name"));
        }
        this.doValidation(newVal);
        if(_.isFunction(this.context.applyConstraints)) {
            this.context.applyConstraints(this.prop("name"), newVal);
        }
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.isFunction(this.context.registerField)) {
            this.context.registerField(this.prop("name"), this);
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        if(_.isFunction(this.context.unregisterField)) {
            this.context.unregisterField(this.prop("name"));
        }
    }

    setErrorMessage(errorMessage) {
        this.setState({
            errorMessage,
        });
    }

    getErrorMessage() {
        return this.state.errorMessage;
    }

    setDisabled(disabled) {
        this.setState({
            disabled,
        });
    }

    setReadonly(readonly) {
        this.setState({
            readonly,
        });
    }

    getDataAnchor() {
        const form = this.getForm();
        if(form) {
            return `${form.prop('name')}-${this.prop('name')}`;
        }
        else {
            return this.prop('name');
        }
    }

    render(props, state) {
        const [{
            className,
            tooltip,
            name,
            label,
            labelComponent,
            value,
            variant,
            disabled,
            readonly,
            required,
            min,
            max,
            minlength,
            maxlength,
            pattern,
            onValueChange,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        return (
            <div
                className={ window.$Utils.classnames(
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
                        { labelComponent }
                    </label>
                    : null
                }
                <div className="slds-form-element__control slds-grow">
                    {
                        this.renderField(props, state, {
                            id,
                            isDisabled,
                            isReadonly,
                        })
                    }
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

AbstractField.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    tooltip: PropTypes.isString('tooltip').demoValue(''),
    name: PropTypes.isString('name').required().demoValue('field'),
    label: PropTypes.isString('label').required().demoValue('Field'),
    value: PropTypes.isObject('value'),
    variant: PropTypes.isString('variant').values([
        'standard',
        'label-hidden',
        'label-removed',
    ]).defaultValue('standard').demoValue('standard'),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    readonly: PropTypes.isBoolean('readonly').demoValue(false),
    required: PropTypes.isBoolean('required').demoValue(false),
    min: PropTypes.isNumber('min'),
    max: PropTypes.isNumber('max'),
    minlength: PropTypes.isNumber('minlength'),
    maxlength: PropTypes.isNumber('maxlength'),
    pattern: PropTypes.isString('pattern'),
    patternMessage: PropTypes.isString('patternMessage').demoValue('standard'),
    validate: PropTypes.isFunction('validate'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    labelComponent: PropTypes.isObject('labelComponent'),
};

AbstractField.propTypesRest = true;
AbstractField.displayName = "AbstractField";
