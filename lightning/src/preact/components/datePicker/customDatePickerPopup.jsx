import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Button from '../button/button';
import styles from './styles.less';

const l10n= {
    months: {
        longhand: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    },
    weekdays: {
        shorthand: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
    },
};

const truncateToDateValue = val => moment(val).hour(0).minute(0).second(0).millisecond(0).toDate().getTime();

const DefaultPeriods = [
    {
        value: 'in_3_days',
        label: 'In 3 days',
        getValue: () => {
            return moment(truncateToDateValue(Date.now())).add(3, 'day').toDate().getTime();
        },
    },
    {
        value: 'in_1_week',
        label: 'In 1 week',
        getValue: () => {
            return moment(truncateToDateValue(Date.now())).add(7, 'day').toDate().getTime();
        },
    },
    {
        value: 'in_2_week',
        label: 'In 2 weeks',
        getValue: () => {
            return moment(truncateToDateValue(Date.now())).add(14, 'day').toDate().getTime();
        },
    },
    {
        value: 'in_1_month',
        label: 'In 1 month',
        getValue: () => {
            return moment(truncateToDateValue(Date.now())).add(1, 'month').toDate().getTime();
        },
    },
    {
        value: 'custom',
        label: 'Custom',
        matchAny: true,
    },
    {
        value: 'none',
        label: 'None',
        matchNone: true,
    },
];

export default class DatePickerPopup extends BaseComponent {
    constructor() {
        super();

        this.isYearMonthChanged = false;
        this.state = _.assign({}, super.state, {
            selectedYear: null,
            selectedMonth: null,
            selectedDate: undefined,
        });
    }

    goToPreviousMonth() {
        const date = this.getCurrentDate();
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

    goToNextMonth() {
        const date = this.getCurrentDate();
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
        this.setState({
            selectedMonth: null,
            selectedYear: null,
            selectedDate: undefined,
        }, () => {
            if(_.isFunction(this.prop('onValueChange'))) {
                this.prop('onValueChange')(newVal);
            }
        });
    }

    getSelectedDateValue() {
        return this.state.selectedDate === undefined ? this.prop('value') : this.state.selectedDate;
    }

    getSelectedDate() {
        const val = this.getSelectedDateValue();
        return val ? new Date(val) : null;
    }

    getCurrentDate() {
        return this.getSelectedDate() || new Date();
    }

    onSelectDate(val, valid) {
        if(valid) {
            this.setState({
                selectedDate: truncateToDateValue(val),
            });
        }
    }

    getCurrentMonthName() {
        const date = this.getCurrentDate();
        const month = _.isNull(this.state.selectedMonth) ? date.getMonth() : this.state.selectedMonth;
        return _.toUpper(l10n.months.longhand[month]);
    }

    getCurrentYear() {
        const date = this.getCurrentDate();
        return this.state.selectedYear || date.getFullYear();
    }

    getNamesOfWeekdays() {
        return _.map(l10n.weekdays.shorthand, v => ({ displayName: v }))
    }

    dateEquals(date1, date2) {
        return date1 && date2 && (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    getPeriodOptions() {
        return this.prop('periods') || DefaultPeriods;
    }

    getPeriod() {
        const val = this.getSelectedDateValue();
        const options = this.getPeriodOptions();
        let option = null;
        if(val) {
            option = _.find(options, opt => opt.getValue && opt.getValue() === val);
            if(!option) {
                option = _.find(options, ['matchAny', true]);
            }
        }
        else {
            option = _.find(options, ['matchNone', true]);
        }

        return option && option.value;
    }

    setPeriod(val) {
        const options = this.getPeriodOptions();
        const option = _.find(options, ['value', val]);
        if(option.matchAny) {
            return;
        }
        else if(option.matchNone) {
            this.setState({
                selectedDate: null,
            });
        }
        else {
            const date = new Date(option.getValue());

            const isValidDate = this.prop('isValidDate');
            const valid = _.isFunction(isValidDate) ? isValidDate(date.getTime()) : true;

            if(valid) {
                this.setState({
                    selectedYear: date.getFullYear(),
                    selectedMonth: date.getMonth(),
                    selectedDate: option.getValue(),
                });
            }
        }
    }

    onCancel() {
        this.setValue(this.prop('value'));
    }

    onSave() {
        this.setValue(this.getSelectedDateValue());
    }

    generateMonth() {
        const isValidDate = this.prop('isValidDate');
        const date = this.getCurrentDate();
        const selectedDate = this.getSelectedDate();
        const dayOfMonth = date.getDate();
        const month = _.isNull(this.state.selectedMonth) ? date.getMonth() : this.state.selectedMonth;
        const year = this.state.selectedYear ? this.state.selectedYear : date.getFullYear();

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
            _.range(5).map(i => {
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
                                <td className={ tdClass } role="gridcell" aria-selected={ selected } aria-disabled={ disabled } onClick={ e => this.onSelectDate(value, valid) }>
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
            className,
            id,
            value,
            onValueChange,
            config,
        }, rest] = this.getPropValues();

        return (
        <div
            id={ `${id}-dropdown` }
            className={ `${className} ${styles.customDatePickerPopup}` }
            { ...rest }
        >
            <div className="slds-grid">
                <div className="">
                    <div className="slds-datepicker__filter slds-grid">
                        <div className="slds-datepicker__filter_month slds-grid slds-grid_align-spread slds-grow">
                            <div className="slds-align-middle">
                                <ButtonIcon variant="bare" alternativeText="Previous Month" iconName="ctc-utility:a_left"
                                    className="slds-button slds-button_icon slds-button_icon-container"
                                    onClick={ e => this.goToPreviousMonth() }></ButtonIcon>
                            </div>
                            <h2 id={ `${id}-month` } className="slds-align-middle" aria-live="assertive" aria-atomic="true">{ this.getCurrentMonthName() + ' ' + this.getCurrentYear() }</h2>
                            <div className="slds-align-middle">
                                <ButtonIcon variant="bare" alternativeText="Next Month" iconName="ctc-utility:a_right"
                                    className="slds-button slds-button_icon slds-button_icon-container"
                                    onClick={ e => this.goToNextMonth() }></ButtonIcon>
                            </div>
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
                            { this.generateMonth() }
                        </tbody>
                    </table>
                </div>
                <div className="slds-grid slds-grid_vertical slds-grid_align-spread">
                    <div className="slds-dueling-list__colum slds-m-around_small">
                        <div className="slds-dueling-list__options">
                            <ul className="slds-listbox slds-listbox_vertical" role="listbox">
                                {
                                    _.map(this.getPeriodOptions(), option => {
                                        const selected = option.value === this.getPeriod();

                                        return (
                                        <li
                                            role="presentation"
                                            className="slds-listbox__item"
                                            onclick={ () => this.setPeriod(option.value) }
                                        >
                                            <div
                                                class={ `slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline ${selected ? 'slds-is-selected' : ''}` }
                                                aria-selected={ selected }
                                                role="option"
                                            >
                                                <span className="slds-media__body">
                                                    <span className="slds-truncate" title={ option.label }>{ option.label }</span>
                                                </span>
                                            </div>
                                        </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="slds-grid slds-p-around_small">
                        <Button
                            label="Cancel"
                            { ...(_.get(config, 'buttons.cancel')) }
                            onClick={ () => this.onCancel() }
                        >
                        </Button>
                        <Button
                            className="slds-col_bump-left"
                            label="OK"
                            variant="primary"
                            { ...(_.get(config, 'buttons.save')) }
                            onClick={ () => this.onSave() }
                        >
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        );
    }
}

DatePickerPopup.propTypes = {
    className: PropTypes.isString('className'),
    id: PropTypes.isString('id'),
    value: PropTypes.isObject('value'),
    onValueChange: PropTypes.isFunction('onValueChange'),
    periods: PropTypes.isArray('periods').shape({
        value: PropTypes.isString('value'),
        label: PropTypes.isString('label'),
        getValue: PropTypes.isFunction('getValue'),
        matchAny: PropTypes.isBoolean('matchAny'),
        matchNone: PropTypes.isBoolean('matchNone'),
    }),
    config: PropTypes.isObject('config'),
    isValidDate: PropTypes.isFunction('isValidDate'),
};

DatePickerPopup.propTypesRest = true;
DatePickerPopup.displayName = "DatePickerPopup";
