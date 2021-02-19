import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import KBI from '../utils/kbi';
import { PrimitiveIcon } from '../icon/icon';

export default class InputShortcut extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {

        });

        this.bind([
            'onKeyDown',
            'clearValue',
        ]);
    }

    clearValue() {
        this.setValue(null);
    }

    onKeyDown(e) {
        e.preventDefault();
        e.stopPropagation();
        const keySequence = KBI.toKeySequence(e);
        this.setValue(keySequence);
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
                        { tooltip ? <Helptext content={ tooltip } isHtml="true" className="slds-m-left_xx-small"></Helptext> : null }
                    </label>
                    : null
                }
                <div className={ window.$Utils.classnames(
                    'slds-form-element__control slds-grow',
                    {
                        'slds-input-has-icon slds-input-has-icon--right': true,
                    }
                    ) }>
                    <input
                        className="slds-input"
                        onKeyDown={ this.onKeyDown }
                        name={ name }
                        value={ value }
                        placeholder={ placeholder }
                        disabled={ isDisabled }
                        readonly={ isReadonly }
                        { ...rest }
                    >
                    </input>
                    <div className="slds-input__icon-group slds-input__icon-group_right">
                        <button className={ window.$Utils.classnames(
                            'slds-input__icon slds-input__icon--right slds-button slds-button--icon',
                            {
                                'slds-show': value,
                                'slds-hide': !value,
                            }
                            ) } onClick={ this.clearValue }>
                            <PrimitiveIcon variant="bare" iconName="ctc-utility:a_clear" className="slds-button__icon"></PrimitiveIcon>
                            <span className="slds-assistive-text">
                                Clear
                            </span>
                        </button>
                    </div>
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

InputShortcut.propTypes = PropTypes.extend(AbstractField.propTypes, {
    placeholder: PropTypes.isString('placeholder').defaultValue('Press keys here').demoValue(''),
    value: PropTypes.isString('value'),
});

InputShortcut.propTypes.name.demoValue('inputShortcut');
InputShortcut.propTypes.label.demoValue('InputShortcut');

InputShortcut.propTypesRest = true;
InputShortcut.displayName = "InputShortcut";
