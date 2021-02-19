import { h, render, Component } from 'preact';
import AbstractPopupField from '../field/popupField';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import DateTimeConvert from '../utils/dateTime';
import { produce, } from '../dataProducer/dataProducer';
import Utils from '../utils/utils';
import Config from '../utils/config';
import Portal from 'preact-portal';

const SECOND = 1000;
const MINUTE = 60000;
const HOUR = 3600000;

if(Config.defineConfig) {
    Config.defineConfig([
        {
            name: 'Time Picker - start time',
            path: '/System/UI/TimePicker/${name}/startTime',
            type: Config.Types.Integer,
            description: 'Set the start time for the time picker, in minutes',
        },
        {
            name: 'Time Picker - end time',
            path: '/System/UI/TimePicker/${name}/endTime',
            type: Config.Types.Integer,
            description: 'Set the end time for the time picker, in minutes',
        },
        {
            name: 'Time Picker - interval',
            path: '/System/UI/TimePicker/${name}/interval',
            type: Config.Types.Integer,
            description: 'Set the interval for the time picker, in minutes',
        },
        {
            name: 'Time Picker - extension',
            path: '/System/UI/TimePicker/${name}/extension',
            type: Config.Types.Extension,
            description: 'Apply extension for the time picker range',
        },
    ]);
}

const getFormattedTime = (value) => {
    return DateTimeConvert.getFormattedTime(value);
};

export const generateOptions = (startTime, endTime, interval) => {
    const options = [];
    for(let i = _.parseInt(startTime); i <= _.parseInt(endTime); i += _.parseInt(interval)) {
        const value = i * MINUTE;
        const label = getFormattedTime(value);
        options.push({
            label,
            value,
        });
    }

    return options;
};

export default class TimePicker extends AbstractPopupField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            options: null,
        });
    }

    componentDidMount() {
        super.componentDidMount();

        let name = this.props.name;
        if(this.context.form) {
            name = this.context.form.getName() + '_' + name;
        }

        const startTime = Config.getValue(`/System/UI/TimePicker/${name}/startTime`, this.context.globalData);
        const endTime = Config.getValue(`/System/UI/TimePicker/${name}/endTime`, this.context.globalData);
        const interval = Config.getValue(`/System/UI/TimePicker/${name}/interval`, this.context.globalData);
        const extension = Config.getValue(`/System/UI/TimePicker/${name}/extension`, this.context.globalData);

        if(extension) {
            Config.loadExtension(`/System/UI/TimePicker/${name}/extension`, this.context.globalData).then(resources => {
                return Utils.retrieve(_.last(resources));
            }).then(extension => {
                this.setState({
                    options: extension,
                });
            });
        }
        else if(startTime || endTime || interval) {
            this.setState({
                options: generateOptions(startTime || 6 * 60, endTime || 20 * 60, interval || 15),
            });
        }
        else if(this.prop('dataProducer')) {
            const dataProducer = this.prop('dataProducer');
            const data = produce(dataProducer);
            if(data.then) {
                data.then(options => {
                    this.setState({
                        options,
                    });
                }, Utils.catchError);
            }
            else if(_.isArray(data)){
                this.setState({
                    options: data,
                });
            }
        }
    }

    getCurrentLabel(options) {
        const option = _.find(options, ["value", this.prop("value")]);
        return option ? option.label : "";
    }

    handleNodeClick(e, index, realOptions) {
        const option = realOptions[index];
        if(option) {
            this.setValue(option.value);
        }
        this.setState({
            prompted: false,
        });
    }

    getOptions() {
        const [{
            options,
            startTime,
            endTime,
            interval,
        }, ] = this.getPropValues();

        if(this.prop('dataProducer')) {
            return this.state.options || [];
        }
        else {
            return !_.isArray(options) ? generateOptions(startTime, endTime, interval) : options;
        }
    }

    isLoading() {
        const dataProducer = this.prop('dataProducer');
        return dataProducer && this.state.options === null;
    }

    setValueOnMobile(val) {
        const newVal = DateTimeConvert.parseFormattedTime(val, {
            hour_24: true,
        });
        if(newVal) {
            this.setValue(newVal);
        }
    }

    getValueOnMobile() {
        return DateTimeConvert.getFormattedTime(this.prop('value'), {
            hour_24: true,
        });
    }

    onTimeValueChange(val) {
        const newVal = DateTimeConvert.parseFormattedTime(val);
        if(newVal) {
            this.setValue(newVal);
        }
        else if(!val) {
            this.setValue(null);
        }
    }

    getTimeValue(options) {
        if(this.prop('value')) {
            const label = this.getCurrentLabel(options);
            if(label) {
                return label;
            }
            else {
                return DateTimeConvert.getFormattedTime(this.prop('value'));
            }
        }
    }

    renderField(props, state, variables) {
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
            options,
            placeholder,
            startTime,
            endTime,
            interval,
            onValueChange,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        this.setPopupSource(id);

        const realOptions = this.getOptions();

        if(window.$Utils.isNonDesktopBrowser()) {
            return (
                <input
                    class="slds-input"
                    type="time"
                    id={ id }
                    disabled={ isDisabled }
                    readOnly={ isReadonly }
                    onchange={ e => this.setValueOnMobile(e.target.value) }
                    value={ this.getValueOnMobile() }
                >
                </input>
            );
        }

        return (
            <div className="slds-combobox_container" data-popup-source={ id }>
                <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-combobox-picklist slds-timepicker" aria-haspopup="listbox" role="combobox">
                    <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                        <input ref={ node => this.setMainInput(node) } type="text" className="slds-input slds-combobox__input" style="border: 1px solid rgb(221, 219, 218);" id={ id } name={ name } value={ this.getTimeValue(realOptions) } placeholder={ placeholder } disabled={ isDisabled } onFocusIn={ e => this.onFocus(e) } onChange={ e => this.onTimeValueChange(e.target.value) } { ...rest }></input>
                        <span className="slds-icon_container slds-icon-utility-clock slds-input__icon slds-input__icon_right" title="Time Picker">
                            <PrimitiveIcon iconName="ctc-utility:a_time" variant="bare" size="x-small"></PrimitiveIcon>
                            <span className="slds-assistive-text">Time Picker</span>
                        </span>
                    </div>
                    <Portal into="body">
                        <div data-popup-source={ id } id={ `listbox-${id}` } role="listbox" className={ window.$Utils.classnames('slds-dropdown_append-to-body', popupClass) } style={ state.popupStyle }>
                            <ul class={ window.$Utils.classnames(
                                'slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown--fluid slds-dropdown--length-5',
                                {
                                    'slds-hide': !state.prompted,
                                }
                                ) } role="presentation">
                                {
                                    _.map(realOptions, (option, index) => {
                                        return (
                                        <li role="presentation" className="slds-listbox__item" id={ `${id}-${index}` } onClick={ e => this.handleNodeClick(e, index, realOptions) }>
                                            <span id={ `listbox-option-${id}-${index}` } className={ window.$Utils.classnames(
                                                'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-media_center',
                                                {
                                                    'slds-is-selected': option.value === value,
                                                }
                                                ) } role="option">
                                                <span className="slds-media__figure">
                                                    <PrimitiveIcon variant="bare" iconName="ctc-utility:a_tick" className="slds-icon slds-icon_x-small slds-listbox__icon-selected"></PrimitiveIcon>
                                                </span>
                                                <span className="slds-media__body">
                                                    <span className="slds-truncate" title={ option.label }>{ option.label }</span>
                                                </span>
                                            </span>
                                        </li>
                                        );
                                    })
                                }
                                <li role="presentation" className={ window.$Utils.classnames(
                                    'slds-listbox__item',
                                    {
                                        'slds-show': this.isLoading(),
                                        'slds-hide': !this.isLoading(),
                                    }
                                    ) } id={ `${id}-loading` }>
                                    <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-loading` }>
                                        <h3 className="slds-text-title_caps" role="presentation">Loading ...</h3>
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </Portal>
                </div>
            </div>
        );
    }
}

TimePicker.propTypes = PropTypes.extend(AbstractPopupField.propTypes, {
    options: PropTypes.isArray('options').shape({
        label: PropTypes.isString('label'),
        value: PropTypes.isNumber('value'),
    }),
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    startTime: PropTypes.isNumber('startTime').defaultValue(6 * 60).demoValue(6 * 60).description("start time in minutes"),
    endTime: PropTypes.isNumber('endTime').defaultValue(18 * 60).demoValue(18 * 60).description("end time in minutes"),
    interval: PropTypes.isNumber('interval').defaultValue(60).demoValue(60).description("interval in minutes"),
    dataProducer: PropTypes.isString('dataProducer').demoValue(''),
});

TimePicker.propTypes.name.demoValue('timePicker');
TimePicker.propTypes.label.demoValue('Time Picker');

TimePicker.propTypesRest = true;
TimePicker.displayName = "TimePicker";
