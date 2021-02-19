import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import { PrimitiveIcon } from '../icon/icon';

export default class VisualPicker extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
        });

        this.bind([
        ]);
    }

    onSelect(option) {
        const value = this.prop('value');
        const select = this.prop('select');

        if(select === 'single') {
            this.setValue(option.value);
        }
        else {
            if(_.includes(value, option.value)) {
                this.setValue(_.without(value, option.value));
            }
            else {
                this.setValue([
                    ...(value || []),
                    option.value,
                ]);
            }
        }
    }

    renderOptionLabel(option, index, variables) {
        const coverable = this.prop('coverable');

        if(coverable) {
            return this.renderCoverableOptionLabel(option, index, variables);
        }
        else {
            return this.renderNoncoverableOptionLabel(option, index, variables);
        }
    }

    renderCoverableOptionLabel(option, index, variables) {
        const renderBody = this.prop('renderBody');

        return (
            <label for={ `visual-picker-${variables.id}-${index}` }>
                <span className="slds-visual-picker__figure slds-visual-picker__icon slds-align_absolute-center">
                    <span className="slds-is-selected">
                        <span className="slds-icon_container">
                            <PrimitiveIcon
                                variant="bare"
                                className="slds-icon slds-icon_large slds-icon-action-check"
                                iconName="action:check"
                            >
                            </PrimitiveIcon>
                        </span>
                    </span>
                    <span className="slds-is-not-selected">
                        <span className="slds-icon_container">
                            <PrimitiveIcon
                                variant="bare"
                                className="slds-icon slds-icon_large slds-icon-text-default"
                                iconName={ option.iconName }
                            >
                            </PrimitiveIcon>
                        </span>
                    </span>
                </span>
                {
                    _.isFunction(renderBody) && (
                    <span className="slds-visual-picker__body">
                        {
                            renderBody(option, index, variables)
                        }
                    </span>
                    )
                }
            </label>
        );
    }

    renderNoncoverableOptionLabel(option, index, variables) {
        const renderFigure = this.prop('renderFigure');
        const renderBody = this.prop('renderBody');

        return (
            <label for={ `visual-picker-${variables.id}-${index}` }>
                <span className="slds-visual-picker__figure slds-visual-picker__text slds-align_absolute-center">
                    {
                        _.isFunction(renderFigure) && renderFigure(option, index, variables)
                    }
                </span>
                <span className="slds-visual-picker__body">
                    {
                        _.isFunction(renderBody) && renderBody(option, index, variables)
                    }
                </span>
                <span className="slds-icon_container slds-visual-picker__text-check">
                    <PrimitiveIcon
                        variant="bare"
                        className="slds-icon slds-icon-text-check slds-icon_x-small"
                        iconName="utility:check"
                    >
                    </PrimitiveIcon>
                </span>
            </label>
        );
    }

    isOptionChecked(option) {
        const value = this.prop('value');
        const select = this.prop('select');

        if(select === 'single') {
            return value === option.value;
        }
        else {
            return _.includes(value, option.value);
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
            onValueChange,
            options,
            size,
            select,
            alignment,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        const variables = {
            id,
            isDisabled,
            isReadonly,
        };

        return (
            <fieldset
                className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'slds-form--inline': variant === 'label-hidden',
                },
                className
                ) }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                {
                    variant !== 'label-removed' ?
                    <legend className="slds-form-element__legend slds-form-element__label slds-form-element__label-has-tooltip">
                        <span className={ window.$Utils.classnames(
                            {
                                'slds-assistive-text': variant === 'label-hidden',
                            }
                            ) }>
                            { label }
                        </span>
                        { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"></Helptext> : null }
                    </legend>
                    : null
                }
                <div className="slds-form-element__control slds-grow">
                    {
                        _.map(options, (option, index) => {
                            return (
                            <div className={ window.$Utils.classnames(
                                `slds-visual-picker slds-visual-picker_${size} slds-visual-picker_${option.variant}`,
                                {
                                    'slds-visual-picker_vertical': alignment === 'vertical',
                                }
                                ) }>
                                <input
                                    type={ select === 'single' ? 'radio' : 'checkbox' }
                                    id={ `visual-picker-${id}-${index}` }
                                    name={ `visual-picker-${id}-${index}` }
                                    value={ option.value }
                                    disabled={ isDisabled || option.disabled }
                                    checked={ this.isOptionChecked(option) }
                                    onClick={ () => this.onSelect(option) }
                                >
                                </input>
                                {
                                    this.renderOptionLabel(option, index, variables)
                                }
                            </div>
                            );
                        })
                    }
                </div>
            </fieldset>
        );
    }
}

VisualPicker.propTypes = PropTypes.extend(AbstractField.propTypes, {
    options: PropTypes.isArray('options').shape({
        label: PropTypes.isString('label'),
        value: PropTypes.isString('value'),
        disabled: PropTypes.isBoolean('disabled'),
        iconName: PropTypes.isString('iconName'),
        variant: PropTypes.isString('variant').values([
            'base',
            'success',
            'warning',
            'error',
        ]),
    }),
    value: PropTypes.isObject('value'),
    size: PropTypes.isString('size').values([
        'small',
        'medium',
        'large',
    ]).defaultValue('medium').demoValue('medium'),
    select: PropTypes.isString('select').values([
        'single',
        'multiple',
    ]).defaultValue('single').demoValue('single'),
    alignment: PropTypes.isString('alignment').values([
        'horizontal',
        'vertical',
    ]).defaultValue('horizontal').demoValue('horizontal'),
    coverable: PropTypes.isBoolean('coverable').defaultValue(true).demoValue(true),
    renderFigure: PropTypes.isFunction('renderFigure'),
    renderBody: PropTypes.isFunction('renderBody'),
});

VisualPicker.propTypes.name.demoValue('visualPicker');
VisualPicker.propTypes.label.demoValue('Visual Picker');

VisualPicker.propTypesRest = true;
VisualPicker.displayName = "VisualPicker";
