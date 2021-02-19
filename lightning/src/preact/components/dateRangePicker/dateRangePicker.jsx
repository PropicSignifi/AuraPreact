import { h, render, Component } from 'preact';
import AbstractPopupField from '../field/popupField';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Tabset from '../tabset/tabset';
import Tab from '../tabset/tab';
import Input from '../input/input';
import DateTimeConvert from '../utils/dateTime';
import FormattedDateTime from '../formattedDateTime/formattedDateTime';
import PropTypes from '../propTypes/propTypes';
import Portal from 'preact-portal';
import styles from './styles.less';

const RangeTypes = [
    {
        name: 'year',
        singular: 'year',
        plural: 'years',
        options: [
            'prev',
            'last_n',
            'this',
            'next_n',
            'next',
            'to_date',
        ],
    },
    {
        name: 'quarter',
        singular: 'quarter',
        plural: 'quarters',
        options: [
            'prev',
            'last_n',
            'this',
            'next_n',
            'next',
            'to_date',
        ],
    },
    {
        name: 'month',
        singular: 'month',
        plural: 'months',
        options: [
            'prev',
            'last_n',
            'this',
            'next_n',
            'next',
            'to_date',
        ],
    },
    {
        name: 'week',
        singular: 'week',
        plural: 'weeks',
        options: [
            'prev',
            'last_n',
            'this',
            'next_n',
            'next',
            'to_date',
        ],
    },
    {
        name: 'day',
        singular: 'day',
        plural: 'days',
        options: [
            'prev',
            'last_n',
            'this',
            'next_n',
            'next',
        ],
        labels: {
            prev: 'Yesterday',
            'this': 'Today',
            next: 'Tomorrow',
        },
    },
];

const defaultValues = {
    'last_n': 12,
    'next_n': 3,
};

export default class DateRangePicker extends AbstractPopupField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            selectedTabId: null,
        });

        this.bind([
            'onTabSelected',
        ]);

        this.setLayeredEditorUI = this.setLayeredEditorUI.bind(this);
    }

    setLayeredEditorUI() {
        if(window.$Utils.isNonDesktopBrowser()) {
            if(_.isFunction(this.context.setLayeredEditorUI)) {
                const ui = this.createLayeredEditor();
                this.context.setLayeredEditorUI(ui, () => {
                    this.setState({
                        prompted: false,
                    });
                }, this.id());
            }
        }
    }

    createLayeredEditor() {
        if(this.state.prompted) {
            const id = this.id();

            return (
                <div id={ `${id}-dropdown` } className={ window.$Utils.classnames(
                    {
                        'slds-hide': !this.state.prompted,
                    },
                    )
                    } style={ this.state.popupStyle } data-popup-source={ id }>
                    { this.renderContent() }
                </div>
            );
        }
    }

    getSelectedTabId() {
        return this.state.selectedTabId || RangeTypes[0].name;
    }

    onTabSelected(newVal) {
        this.setState({
            selectedTabId: newVal,
        });
    }

    renderContent() {
        const [start, end] = DateTimeConvert.convertDateRange(this.prop('value'));

        return (
        <div>
            <Tabset
                variant="scoped"
                selectedTabId={ this.getSelectedTabId() }
                onSelect={ this.onTabSelected }
            >
                {
                    _.map(RangeTypes, rangeType => {
                        return (
                        <Tab
                            id={ rangeType.name }
                            label={ _.capitalize(rangeType.plural) }
                        >
                            <div className="slds-grid slds-wrap">
                                {
                                    _.map(rangeType.options, option => {
                                        return (
                                        <div className="slds-col slds-size_1-of-2">
                                            { this.renderChoice(rangeType, option) }
                                        </div>
                                        );
                                    })
                                }
                            </div>
                            <div className="slds-p-top_small slds-align_absolute-center slds-border_top">
                                {
                                    start && end && (
                                    <div className="slds-grid slds-grid_vertical-align-center">
                                        <FormattedDateTime type="date" value={ start }></FormattedDateTime>
                                        <div className="slds-m-horizontal_small">
                                            to
                                        </div>
                                        <FormattedDateTime type="date" value={ end }></FormattedDateTime>
                                    </div>
                                    )
                                }
                            </div>
                        </Tab>
                        );
                    })
                }

            </Tabset>
        </div>
        );
    }

    renderChoice(rangeType, option) {
        const id = `${this.id()}-${rangeType.name}`;
        let [rangeTypeName, opt, val] = _.split(this.prop('value'), '/');
        const checked = rangeTypeName === rangeType.name && opt === option;

        return (
            <div className="slds-grid slds-grid_vertical-align-center slds-m-around_xxx-small">
                <input
                    id={ `${id}-${option}` }
                    name={ id }
                    type="radio"
                    value={ option }
                    checked={ checked }
                    onchange={ () => this.onChoiceChange(rangeType.name, option, val) }
                >
                </input>
                <label className="slds-m-left_small" htmlFor={ `${id}-${option}` }>
                    { this.renderChoiceLabel(rangeType, option, checked ? val : defaultValues[option] || '', checked ? 'edit' : 'disabled') }
                </label>
            </div>
        );
    }

    renderChoiceLabel(rangeType, option, val, displayType) {
        if(rangeType.labels && rangeType.labels[option]) {
            return rangeType.labels[option];
        }

        if(option === 'prev') {
            return 'Previous ' + rangeType.singular;
        }
        else if(option === 'this') {
            return 'This ' + rangeType.singular;
        }
        else if(option === 'next') {
            return 'Next ' + rangeType.singular;
        }
        else if(option === 'last_n') {
            if(displayType === 'edit' || displayType === 'disabled') {
                return (
                    <div className="slds-grid slds-grid_vertical-align-center">
                        Last
                        <Input
                            className={ `slds-m-horizontal_xx-small ${styles.input}` }
                            name={ `${rangeType.name}-${option}` }
                            label={ option }
                            variant="label-removed"
                            disabled={ displayType === 'disabled' }
                            type="number"
                            value={ val }
                            onValueChange={ newVal => this.onChoiceChange(rangeType.name, option, newVal) }
                        >
                        </Input>
                        { rangeType.plural }
                    </div>
                );
            }
            else {
                return 'Last ' + val + ' ' + rangeType.plural;
            }
        }
        else if(option === 'next_n') {
            if(displayType === 'edit' || displayType === 'disabled') {
                return (
                    <div className="slds-grid slds-grid_vertical-align-center">
                        Next
                        <Input
                            className={ `slds-m-horizontal_xx-small ${styles.input}` }
                            name={ `${rangeType.name}-${option}` }
                            label={ option }
                            variant="label-removed"
                            disabled={ displayType === 'disabled' }
                            type="number"
                            value={ val }
                            onValueChange={ newVal => this.onChoiceChange(rangeType.name, option, newVal) }
                        >
                        </Input>
                        { rangeType.plural }
                    </div>
                );
            }
            else {
                return 'Next ' + val + ' ' + rangeType.plural;
            }
        }
        else if(option === 'to_date') {
            return _.capitalize(rangeType.singular) + ' to date';
        }
    }

    onChoiceChange(rangeTypeName, opt, val) {
        if(rangeTypeName && opt) {
            const [oldRangeTypeName, oldOpt, oldVal] = _.split(this.prop('value'), '/');
            if(oldRangeTypeName !== rangeTypeName || oldOpt !== opt) {
                val = defaultValues[opt] ? defaultValues[opt] : '';
            }
            this.setValue(`${rangeTypeName}/${opt}/${val}`);
        }
        else {
            this.setValue(null);
        }
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
            onValueChange,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        this.setPopupSource(id);

        this.setLayeredEditorUI();

        let [rangeTypeName, opt, val] = _.split(value, '/');
        const rangeType = _.find(RangeTypes, ['name', rangeTypeName]);

        return (
            <div>
                <div ref={ node => this.setMainInput(node) } className="slds-input-has-icon slds-input-has-icon_right" data-popup-source={ id }>
                    <input type="text" className={ `slds-input ${styles.dateRangePickerInput}` } id={ id } name={ name } value={ rangeType ? this.renderChoiceLabel(rangeType, opt, val) : '' } placeholder={ placeholder } disabled={ isDisabled } readonly={ true } onFocusIn={ e => this.onFocus(e) } { ...rest }></input>
                    <ButtonIcon alternativeText="Select a Date" variant="bare" iconName="ctc-utility:a_date" className="slds-button slds-button_icon slds-input__icon slds-input__icon_right" disabled={ isDisabled } onClick={ e => this.onFocus(e) }></ButtonIcon>
                </div>
                <Portal into="body">
                    <div id={ `${id}-dropdown` } className={ window.$Utils.classnames(
                        `slds-dropdown slds-dropdown_left slds-dropdown_append-to-body ${styles.dropdown}`,
                        {
                            'slds-hide': !state.prompted,
                        },
                        popupClass
                        )
                        } style={ state.popupStyle } data-popup-source={ id }>
                        { this.renderContent() }
                    </div>
                </Portal>
            </div>
        );
    }
}

DateRangePicker.propTypes = PropTypes.extend(AbstractPopupField.propTypes, {
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    value: PropTypes.isString('value'),
});

DateRangePicker.propTypes.name.demoValue('dateRangePicker');
DateRangePicker.propTypes.label.demoValue('Date Range Picker');

DateRangePicker.propTypesRest = true;
DateRangePicker.displayName = "DateRangePicker";
