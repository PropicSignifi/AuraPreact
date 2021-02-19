import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import DatePicker from '../datePicker/datePicker';
import TimePicker from '../timePicker/timePicker';
import styles from './styles.css';

export default class DatetimePicker extends AbstractField {
    constructor() {
        super();
    }

    getTrimmedDate(value) {
        return moment(value).hour(0).minute(0).second(0).millisecond(0).toDate().getTime();
    }

    getDate() {
        return this.prop("value") ?
            this.getTrimmedDate(this.prop("value")) :
            null;
    }

    getTime() {
        return this.prop("value") ?
            moment(this.prop('value')).toDate().getTime() - this.getDate() :
            null;
    }

    getDefaultDate() {
        return this.getTrimmedDate(Date.now());
    }

    setDate(newVal) {
        if(this.prop("value")) {
            this.setValue(newVal + this.getTime());
        }
        else {
            this.setValue(newVal);
        }
    }

    setTime(newVal) {
        const date = this.getDate();
        this.setValue(newVal + (date ? date : this.getDefaultDate()));
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
            startTime,
            endTime,
            interval,
        }, rest] = this.getPropValues();
        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        return (
            <div
                className={ window.$Utils.classnames('slds-form slds-form--compound', className) }
                data-anchor={ this.getDataAnchor() }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                <fieldset className="slds-form-element">
                    {
                        variant !== 'label-removed' ?
                        <div className={ window.$Utils.classnames('slds-form-element__label', styles.label) }>
                            <span className={ variant === 'label-hidden' ? 'slds-assistive-text' : '' }>
                                { label }
                            </span>
                            { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                            { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"></Helptext> : null }
                        </div>
                        : null
                    }
                    <div className="slds-form-element__group">
                        <div className="slds-form-element__row">
                            <DatePicker name={ `${id}-datePicker` } label="Date" variant={ variant } value={ this.getDate() }
                                disabled={ isDisabled } readonly={ isReadonly } required={ required } className="slds-grow"
                                onValueChange={ newVal => this.setDate(newVal) }></DatePicker>
                            <TimePicker name={ `${id}-timePicker` } label="Time" variant={ variant } value={ this.getTime() }
                                disabled={ isDisabled } readonly={ isReadonly } required={ required } className="slds-grow"
                                startTime={ startTime } endTime={ endTime } interval={ interval }
                                onValueChange={ newVal => this.setTime(newVal) }></TimePicker>
                        </div>
                    </div>
                </fieldset>
            </div>
        );
    }
}

DatetimePicker.propTypes = PropTypes.extend(AbstractField.propTypes, {
    startTime: PropTypes.isNumber('startTime'),
    endTime: PropTypes.isNumber('endTime'),
    interval: PropTypes.isNumber('interval'),
});

DatetimePicker.propTypes.name.demoValue('datetimePicker');
DatetimePicker.propTypes.label.demoValue('Date Time Picker');

DatetimePicker.propTypesRest = true;
DatetimePicker.displayName = "DatetimePicker";
