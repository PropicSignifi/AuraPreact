import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import SuggestionBox from '../suggestionBox/suggestionBox';

export default class IconPicker extends AbstractField {
    constructor() {
        super();
    }

    getCurrentValue() {
        if(this.prop("value")) {
            return {
                label: this.prop("value"),
                value: this.prop("value"),
            };
        }
        else {
            return null;
        }
    }

    onValueChange(newVal) {
        if(newVal) {
            this.setValue(newVal.value);
        }
        else {
            this.setValue(null);
        }
    }

    render(props, state) {
        const [{
            className,
            popupClass,
            tooltip,
            name,
            label,
            value,
            variant,
            disabled,
            readonly,
            required,
            placeholder,
            category,
            cache,
            onValueChange,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        const getSuggestions = value => {
            const sprite = window.$Icons.getSprite(category);
            return _.chain(Object.keys(sprite)).
                map(key => {
                    const iconName = category + ':' + key;
                    return {
                        label: iconName,
                        value: iconName,
                        iconName: iconName,
                        iconContainer: "icon",
                    };
                }).
                sortBy('value').
                value();
        };

        return (
            <SuggestionBox
                variant={ variant }
                name={ name }
                label={ label }
                disabled={ isDisabled }
                readonly={ isReadonly }
                required={ required }
                className={ `slds-iconPicker ${className}` }
                popupClass={ `slds-iconPicker ${className}` }
                value={ this.getCurrentValue() }
                cache={ cache }
                placeholder={ placeholder }
                tooltip={ tooltip }
                minLetters="0"
                getSuggestions={ getSuggestions }
                onValueChange={ newVal => this.onValueChange(newVal) }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
            </SuggestionBox>
        );
    }
}

IconPicker.propTypes = PropTypes.extend(AbstractField.propTypes, {
    popupClass: PropTypes.isString('popupClass').demoValue(''),
    value: PropTypes.isString('value'),
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    category: PropTypes.isString('category').defaultValue('ctc-utility').demoValue('ctc-utility'),
    cache: PropTypes.isBoolean('cache').defaultValue(true).demoValue(true),
});

IconPicker.propTypes.name.demoValue('iconPicker');
IconPicker.propTypes.label.demoValue('Icon Picker');

IconPicker.propTypesRest = true;
IconPicker.displayName = "IconPicker";
