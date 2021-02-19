import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';

export default class Form extends BaseComponent {
    constructor() {
        super();

        this.$fields = {};
        this.$extension = null;
        this.validate = this.validate.bind(this);
    }

    registerField(name, field) {
        if(name && field) {
            this.$fields[name] = field;
        }
    }

    registerExtension(extension) {
        this.$extension = extension;
    }

    unregisterField(name) {
        delete this.$fields[name];
    }

    getName() {
        return this.prop('name');
    }

    validate(name, value) {
        const msgs = [];

        const validations = {};

        _.each(this.prop("validators"), validator => {
            if(name && !_.includes(validator.fieldNames, name)) {
                return;
            }
            const fields = _.map(validator.fieldNames, fieldName => {
                return this.$fields[fieldName];
            });
            const values = _.map(fields, field => {
                if(field) {
                    return field.props.name === name ?
                        value :
                        field.props.value;
                }
            });
            const msg = validator.validate(values, fields);
            if(msg) {
                msgs.push(msg);
            }
            _.each(fields, field => {
                if(field) {
                    validations[field.props.name] = validations[field.props.name] || msg;
                }
            });
        });

        if(!name) {
            // do all validations
            _.each(this.$fields, field => {
                if(_.isFunction(field.validate)){
                    const msg = field.validate(field.getValue());
                    if(msg) {
                        msgs.push(msg);
                    }

                    validations[field.props.name] = validations[field.props.name] || msg;
                }
            });
        }
        else {
            const field = this.$fields[name];
            if(field && _.isFunction(field.validate)){
                const msg = field.validate(value);
                if(msg) {
                    msgs.push(msg);
                }

                validations[field.props.name] = validations[field.props.name] || msg;
            }
        }

        _.each(validations, (msg, name) => {
            const field = this.$fields[name];
            if(field){
                field.setErrorMessage(msg);
            }
        });

        if(this.$extension) {
            const extensionMsgs = this.$extension.validate();
            msgs.push(...(extensionMsgs || []));
        }

        return msgs;
    }

    clearMessages() {
        _.each(this.$fields, field => {
            field.setErrorMessage(null);
        });
    }

    applyConstraints(name, value) {
        if(!name) {
            return;
        }
        _.each(this.prop("constraints"), constraint => {
            if(!_.includes(constraint.fieldNames, name)) {
                return;
            }
            const fields = _.map(constraint.fieldNames, fieldName => {
                return this.$fields[fieldName];
            });
            const values = _.map(fields, field => {
                return field.props.name === name ?
                    value :
                    field.props.value;
            });
            constraint.apply(values, name);
        });
    }

    getChildContext(context) {
        return _.assign({}, super.getChildContext(context), {
            registerExtension: this.registerExtension.bind(this),
            registerField: this.registerField.bind(this),
            unregisterField: this.unregisterField.bind(this),
            validate: this.validate,
            applyConstraints: this.applyConstraints.bind(this),
            form: this,
        });
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.isFunction(this.context.registerForm)) {
            this.context.registerForm(this);
        }
    }

    componentDidUpdate() {
        super.componentDidUpdate();

        _.each(this.$fields, field => {
            if(!_.isUndefined(this.prop("disabled")) && _.isFunction(field.setDisabled)) {
                field.setDisabled(this.prop("disabled"));
            }
            if(!_.isUndefined(this.prop("readonly")) && _.isFunction(field.setReadonly)) {
                field.setReadonly(this.prop("readonly"));
            }
        });

        if(this.$extension) {
            this.$extension.setDisabled(this.prop('disabled'));
            this.$extension.setReadonly(this.prop('readonly'));
        }
    }

    saveExtension(id, submit = true) {
        if(this.$extension) {
            return this.$extension.save(id, submit);
        }
        else {
            return Promise.resolve(null);
        }
    }

    saveExtensionAsJSON() {
        return this.saveExtension(null, false).then(data => data ? JSON.stringify(data) : undefined);
    }

    render(props, state) {
        const [{
            className,
            variant,
            layout,
            name,
            validators,
            constraints,
            readonly,
            disabled,
            children,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Form name is required");

        return (
            <div
                key={ name }
                className={ window.$Utils.classnames(
                'slds-form',
                {
                    'slds-form_compound': variant === 'compound',
                    'slds-form_stacked': layout === 'stacked' && variant !== 'compound',
                    'slds-form_horizontal': layout === 'horizontal' && variant !== 'compound',
                },
                className
                ) }
                data-anchor={ this.prop('name') }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                { children }
            </div>
        );
    }
}

Form.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        "base",
        "compound",
    ]).defaultValue('base').demoValue('base'),
    layout: PropTypes.isString('layout').values([
        "base",
        "stacked",
        "horizontal",
    ]).defaultValue('base').demoValue('base'),
    name: PropTypes.isString('name').required().demoValue('form'),
    validators: PropTypes.isArray('validators').shape({
        fieldNames: PropTypes.isArray('fieldNames'),
        validate: PropTypes.isFunction('validate'),
    }),
    constraints: PropTypes.isArray('constraints').shape({
        fieldNames: PropTypes.isArray('fieldNames'),
        apply: PropTypes.isFunction('validate'),
    }),
    readonly: PropTypes.isBoolean('readonly').demoValue(false),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    children: PropTypes.isChildren('children'),
};

Form.propTypesRest = true;
Form.displayName = "Form";
