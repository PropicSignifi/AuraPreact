import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Select from '../select/select';
import Button from '../button/button';
import Portal from 'preact-portal';
import styles from './styles.less';

const l10n= {
    months: {
        longhand: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    },
};

export default class DatePickerPopup extends BaseComponent {
    constructor() {
        super();

        this.isYearMonthChanged = false;
        this.state = _.assign({}, super.state, {
            selectedYear: null,
            selectedMonth: null
        });
    }

    goToPreviousMonth(e, date) {
        const month = _.isNull(this.state.selectedMonth) ? date.getMonth() : this.state.selectedMonth;
        const year = this.state.selectedYear ? this.state.selectedYear : date.getFullYear();

        this.isYearMonthChanged = true;

        if(month === 0) {
            this.setState({
                selectedYear: year - 1,
                selectedMonth: 11,
            });
        }
        else {
            this.setState({
                selectedMonth: month - 1,
            });
        }
    }

    goToNextMonth(e, date) {
        const month = _.isNull(this.state.selectedMonth) ? date.getMonth() : this.state.selectedMonth;
        const year = this.state.selectedYear ? this.state.selectedYear : date.getFullYear();

        this.isYearMonthChanged = true;

        if(month === 11) {
            this.setState({
                selectedYear: year + 1,
                selectedMonth: 0,
            });
        }
        else {
            this.setState({
                selectedMonth: month + 1,
            });
        }
    }

    setValue(value) {
        this.isYearMonthChanged = false;

        const newVal = value ? moment(value).hour(0).minute(0).second(0).millisecond(0).toDate().getTime() : null;
        if(_.isFunction(this.prop('onValueChange'))) {
            this.prop('onValueChange')(newVal);
        }
    }

    goToToday(e) {
        this.setState({
            selectedYear: moment(new Date()).format('YYYY'),
            selectedMonth: new Date().getMonth(),
        });
        this.setValue(new Date().getTime());
    }

    onSelectDate(e, val, valid) {
        if(valid) {
            this.setValue(val);
        }
    }

    getCurrentMonthName(date) {
        const month = _.isNull(this.state.selectedMonth) ? date.getMonth() : this.state.selectedMonth;
        return _.toUpper(l10n.months.longhand[month]);
    }

    getCurrentYear(date) {
        return this.state.selectedYear || date.getFullYear();
    }

    handleYearChange(newVal) {
        this.isYearMonthChanged = true;
        this.setState({
            selectedYear: newVal,
        });
    }

    getYearOptions(now, startYear, endYear) {
        const years = [];

        for (let i = startYear; i <= endYear; i++) {
            years.push({
                label: `${i}`,
                value: i,
            });
        }

        return years;
    }

    getNamesOfWeekdays() {
        const firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1;
        const namesOfWeekDays = $A.get("$Locale.nameOfWeekdays");
        _.each(namesOfWeekDays, function(name) {
            name.displayName = _.capitalize(name.shortName);
        });
        const days = [];
        if (_.isNumber(firstDayOfWeek) && _.isArray(namesOfWeekDays)) {
            for (let i = firstDayOfWeek; i < namesOfWeekDays.length; i++) {
                days.push(namesOfWeekDays[i]);
            }
            for (let j = 0; j < firstDayOfWeek; j++) {
                days.push(namesOfWeekDays[j]);
            }
        }

        return days;
    }

    dateEquals(date1, date2) {
        return date1 && date2 && (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    generateMonth(date) {
        const isValidDate = this.prop('isValidDate');
        const dayOfMonth = date.getDate();
        const month = _.isNull(this.state.selectedMonth) ? date.getMonth() : this.state.selectedMonth;
        const year = this.state.selectedYear ? this.state.selectedYear : date.getFullYear();

        const selectedDate = this.isYearMonthChanged ? null : new Date(year, month, dayOfMonth);
        const today = new Date();
        const d = new Date();
        d.setDate(1);
        d.setFullYear(year);
        d.setMonth(month);
        const firstDayOfWeek = $A.get("$Locale.firstDayOfWeek") - 1;
        let startDay = d.getDay();
        while(startDay !== firstDayOfWeek) {
            d.setDate(d.getDate() - 1);
            startDay = d.getDay();
        }

        return (
            _.range(6).map(i => {
                return (
                    <tr>
                        {
                            _.range(7).map(j => {
                                let tdClass = '';
                                let disabled = false;
                                let selected = false;

                                if(d.getMonth() === month - 1 ||
                                d.getFullYear() === year - 1 ||
                                d.getMonth() === month + 1 ||
                                d.getFullYear() === year + 1) {
                                    disabled = true;
                                    tdClass = 'slds-disabled-text';
                                }

                                if(this.dateEquals(d, today)) {
                                    tdClass += ' slds-is-today';
                                }

                                if(this.dateEquals(d, selectedDate)) {
                                    selected = true;
                                    tdClass += ' slds-is-selected';
                                }

                                const label = d.getDate();
                                const value = d.getTime();

                                const valid = _.isFunction(isValidDate) ? isValidDate(value) : true;

                                d.setDate(d.getDate() + 1);

                                return (
                                <td className={ tdClass } role="gridcell" aria-selected={ selected } aria-disabled={ disabled } onClick={ e => this.onSelectDate(e, value, valid) }>
                                   <span className={ `slds-day ${valid ? '' : styles.invalidDay}` } >{ label }</span>
                                </td>
                                );
                            })
                        }
                    </tr>
                );
            })
        );
    }

    render(props, state) {
        const [{
            id,
            startYear,
            endYear,
            value,
            onValueChange,
        }, rest] = this.getPropValues();

        const now = new Date();
        const date = value ? new Date(value) : now;

        return (
        <div
            id={ `${id}-dropdown` }
            { ...rest }
        >
            <div className="slds-datepicker__filter slds-grid">
                <div className="slds-datepicker__filter_month slds-grid slds-grid_align-spread slds-grow">
                    <div className="slds-align-middle">
                        <ButtonIcon variant="bare" alternativeText="Previous Month" iconName="ctc-utility:a_left"
                            className="slds-button slds-button_icon slds-button_icon-container"
                            onClick={ e => this.goToPreviousMonth(e, date) }></ButtonIcon>
                    </div>
                    <h2 id={ `${id}-month` } className="slds-align-middle" aria-live="assertive" aria-atomic="true">{ this.getCurrentMonthName(date) }</h2>
                    <div className="slds-align-middle">
                        <ButtonIcon variant="bare" alternativeText="Next Month" iconName="ctc-utility:a_right"
                            className="slds-button slds-button_icon slds-button_icon-container"
                            onClick={ e => this.goToNextMonth(e, date) }></ButtonIcon>
                    </div>
                </div>
                <div className="slds-shrink-none">
                    <Select name="yearSelect" label="Select Year" variant="label-hidden"
                        value={ this.getCurrentYear(date) } onValueChange={ newVal => this.handleYearChange(newVal) } options={ this.getYearOptions(now, startYear, endYear) }>
                    </Select>
                </div>
            </div>
            <table className="slds-datepicker__month" role="grid" aria-labelledby={ `${id}-month` }>
                <thead>
                    <tr id={ `${id}-weekdays` }>
                        {
                            _.map(this.getNamesOfWeekdays(), day => {
                                return (
                                <th scope="col">
                                    <abbr title={ day.displayName }>{ day.displayName }</abbr>
                                </th>
                                );
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                    { this.generateMonth(date) }
                </tbody>
            </table>
            <div className="slds-align_absolute-center">
                <Button variant="base" label="Today" onClick={ e => this.goToToday(e) } className="slds-button slds-text-link"></Button>
            </div>
        </div>
        );
    }
}

DatePickerPopup.propTypes = {
    id: PropTypes.isString('id'),
    value: PropTypes.isObject('value'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    startYear: PropTypes.isNumber('startYear'),
    endYear: PropTypes.isNumber('endYear'),
    isValidDate: PropTypes.isFunction('isValidDate'),
};

DatePickerPopup.propTypesRest = true;
DatePickerPopup.displayName = "DatePickerPopup";
