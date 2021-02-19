import { h, render, Component } from 'preact';
import AbstractPopupField from '../field/popupField';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Select from '../select/select';
import Button from '../button/button';
import DatePickerPopup from './datePickerPopup';
import CustomDatePickerPopup from './customDatePickerPopup';
import Portal from 'preact-portal';
import styles from './styles.less';

export default class DatePicker extends AbstractPopupField {
    constructor() {
        super();
    }

    getFormattedDate(value) {
        if(window.$Utils.isNonDesktopBrowser()) {
            return moment(value).format('YYYY-MM-DD');
        }
        else {
            if(_.isFunction(this.prop('humanize'))) {
                return this.prop('humanize')(value);
            }

            return window.$Formatter.format("datetime", value);
        }
    }

    onChange(e) {
        const val = e.target.value;
        const newVal = val && (window.$Formatter.parse("datetime", val) || moment(val).toDate().getTime());
        this.setDateValue(newVal);
    }

    setDateValue(newVal) {
        this.setState({
            prompted: false,
        }, () => {
            this.setValue(newVal);
        });
    }

    renderField(props, state, variables) {
        const now = new Date();

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
            startYear,
            endYear,
            style,
            iconName,
            humanize,
            enforceHumanizedText,
            onValueChange,
            datePickerPopup,
            datePickerPopupOptions,
            isValidDate,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        this.setPopupSource(id);

        if(window.$Utils.isNonDesktopBrowser()) {
            return (
                <input style={ { 'min-width': '100%' } } type={ !isDisabled && !isReadonly ? 'date' : 'text' } className="slds-input" id={ id } name={ name } value={ this.getFormattedDate(value) } placeholder={ placeholder } disabled={ isDisabled } readonly={ isReadonly } onChange={ e => this.onChange(e) } { ...rest }></input>
            );
        }

        const DatePickerPopupImpl = datePickerPopup || (style === 'custom' ? CustomDatePickerPopup : DatePickerPopup)
        const formattedDate = this.getFormattedDate(value);
        const size = _.isFunction(humanize) && enforceHumanizedText ? _.size(formattedDate) : undefined;

        return (
            <div className={ className }>
                <div ref={ node => this.setMainInput(node) } className={ `slds-input-has-icon slds-input-has-icon_right ${styles.datePickerInput}` } data-popup-source={ id }>
                    <input type="text" autocomplete="off" className="slds-input" id={ id } name={ name } value={ formattedDate } placeholder={ placeholder } disabled={ isDisabled } readonly={ isReadonly || _.isFunction(humanize) } onFocusIn={ e => this.onFocus(e) } onChange={ e => this.onChange(e) } size={ size } { ...rest }></input>
                    <ButtonIcon alternativeText="Select a Date" variant="bare" iconName={ iconName } className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" disabled={ isDisabled } onClick={ e => this.onFocus(e) }></ButtonIcon>
                </div>
                <Portal into="body">
                    <DatePickerPopupImpl
                        id={ id }
                        className={ window.$Utils.classnames(
                            'slds-datepicker slds-dropdown slds-dropdown_left slds-dropdown_append-to-body',
                            styles.datePicker,
                            {
                                'slds-hide': !state.prompted,
                            },
                            popupClass
                        )
                        }
                        style={ state.popupStyle }
                        data-popup-source={ id }
                        value={ value }
                        onValueChange={ newVal => this.setDateValue(newVal) }
                        startYear={ startYear }
                        endYear={ endYear }
                        isValidDate={ isValidDate }
                        { ...datePickerPopupOptions }
                    >
                    </DatePickerPopupImpl>
                </Portal>
            </div>
        );
    }
}

const defaultStartYear = new Date().getFullYear() - 100;
const defaultEndYear = new Date().getFullYear() + 50;

DatePicker.propTypes = PropTypes.extend(AbstractPopupField.propTypes, {
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    iconName: PropTypes.isString('iconName').defaultValue('ctc-utility:a_date'),
    humanize: PropTypes.isFunction('humanize'),
    enforceHumanizedText: PropTypes.isBoolean('enforceHumanizedText'),
    isValidDate: PropTypes.isFunction('isValidDate'),
    style: PropTypes.isString('style').values(['default', 'custom']).defaultValue('default').demoValue('default'),
    startYear: PropTypes.isNumber('startYear').defaultValue(defaultStartYear).demoValue(defaultStartYear),
    endYear: PropTypes.isNumber('endYear').defaultValue(defaultEndYear).demoValue(defaultEndYear),
    datePickerPopup: PropTypes.isObject('datePickerPopup').description('The popup implementation for the date picker'),
    datePickerPopupOptions: PropTypes.isObject('datePickerPopupOptions').description('The date picker popup options'),
});

DatePicker.propTypes.name.demoValue('datePicker');
DatePicker.propTypes.label.demoValue('Date Picker');

DatePicker.propTypesRest = true;
DatePicker.displayName = "DatePicker";
