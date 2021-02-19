import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import { PrimitiveIcon } from '../icon/icon';
import RadioGroup from '../radioGroup/radioGroup';
import style from './styles.less';

const defaultGroupName = 'Other';

export default class DualListbox extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            selectedIndexes: [],
            selectedLeft: false,
            selectedGroup: null,
        });
    }

    handleOptionClick(e, selectedIndex, selectedLeft) {
        if(e.shiftKey) {
            if(_.isEmpty(this.state.selectedIndexes)) {
                this.setState({
                    selectedIndexes: [selectedIndex],
                    selectedLeft,
                });
            }
            else {
                const lastIndex = _.last(this.state.selectedIndexes);
                const firstIndex = _.first(this.state.selectedIndexes);
                if(selectedIndex > lastIndex) {
                    this.setState({
                        selectedIndexes: [
                            ...this.state.selectedIndexes,
                            ..._.range(lastIndex + 1, selectedIndex + 1),
                        ],
                        selectedLeft,
                    });
                }
                else {
                    this.setState({
                        selectedIndexes: [
                            ..._.range(selectedIndex, firstIndex),
                            ...this.state.selectedIndexes,
                        ],
                        selectedLeft,
                    });
                }
            }
        }
        else if(e.ctrlKey || e.metaKey) {
            this.setState({
                selectedIndexes: [
                    ...this.state.selectedIndexes,
                    selectedIndex,
                ],
                selectedLeft,
            });
        }
        else {
            this.setState({
                selectedIndexes: [selectedIndex],
                selectedLeft,
            });
        }
    }

    handleLeftButtonClick(e) {
        if(!this.state.selectedLeft) {
            const selectedOptions = this.getSelectedOptions();
            let newVal = this.prop("value");
            let newSelectedIndexes = [];
            for(const selectedIndex of this.state.selectedIndexes) {
                const selectedOption = selectedOptions[selectedIndex];
                if(selectedOption && !selectedOption.locked) {
                    newVal = _.without(newVal, selectedOption.value);
                }
            }
            this.setValue(newVal);
            this.setState({
                selectedLeft: true,
                selectedIndexes: newSelectedIndexes,
            });
        }
    }

    handleRightButtonClick(e) {
        if(this.state.selectedLeft) {
            const selectedOptions = this.getSourceOptions();
            let newVal = this.prop("value");
            let newSelectedIndexes = [];
            for(const selectedIndex of this.state.selectedIndexes) {
                const selectedOption = selectedOptions[selectedIndex];
                if(selectedOption && !selectedOption.locked) {
                    newVal = [...newVal, selectedOption.value];
                }
            }
            this.setValue(newVal);
            this.setState({
                selectedLeft: false,
                selectedIndexes: newSelectedIndexes,
            });
        }
    }

    handleUpButtonClick(e) {
        const selectedIndexes = this.state.selectedIndexes;
        if(_.size(selectedIndexes) > 1) {
            return;
        }
        const selectedIndex = selectedIndexes[0];
        if(!this.state.selectedLeft && selectedIndex >= 1) {
            const selectedOptions = this.getSelectedOptions();
            if(selectedOptions[selectedIndex].locked) {
                return;
            }
            const newVal = _.clone(this.prop("value"));
            newVal[selectedIndex - 1] = this.prop("value")[selectedIndex];
            newVal[selectedIndex] = this.prop("value")[selectedIndex - 1];
            this.setValue(newVal);
            this.setState({
                selectedIndexes: [selectedIndex - 1],
            });
        }
    }

    handleDownButtonClick(e) {
        const selectedIndexes = this.state.selectedIndexes;
        if(_.size(selectedIndexes) > 1) {
            return;
        }
        const selectedIndex = selectedIndexes[0];
        if(!this.state.selectedLeft && selectedIndex <= _.size(this.prop("value")) - 2) {
            const selectedOptions = this.getSelectedOptions();
            if(selectedOptions[selectedIndex].locked) {
                return;
            }
            const newVal = _.clone(this.prop("value"));
            newVal[selectedIndex + 1] = this.prop("value")[selectedIndex];
            newVal[selectedIndex] = this.prop("value")[selectedIndex + 1];
            this.setValue(newVal);
            this.setState({
                selectedIndexes: [selectedIndex + 1],
            });
        }
    }

    getSourceOptions() {
        return _.filter(this.prop("options"), option => {
            if(_.includes(this.prop("value"), option.value)) {
                return false;
            }

            const selectedGroup = this.getSelectedGroup();
            if(selectedGroup) {
                const group = option.group || defaultGroupName;
                if(selectedGroup !== group) {
                    return false;
                }
            }

            return true;
        });
    }

    getSourceGroups() {
        return _.chain(this.prop("options"))
            .map(option => option.group || defaultGroupName)
            .uniq()
            .value();
    }

    getSelectedGroup() {
        return this.state.selectedGroup || _.first(this.getSourceGroups());
    }

    getSelectedOptions() {
        const groups = this.getSourceGroups();

        if(_.size(groups) <= 1) {
            return _.chain(this.prop("value"))
                .map(item => {
                    return _.find(this.prop("options"), ["value", item]);
                })
                .compact()
                .value();
        }
        else {
            return _.chain(this.prop("value"))
                .map(item => {
                    return _.find(this.prop("options"), ["value", item]);
                })
                .compact()
                .groupBy(item => item.group || defaultGroupName)
                .map((items, key) => {
                    return [
                        {
                            label: key,
                            value: "",
                            isCategory: true,
                        },
                        ...items,
                    ];
                })
                .sortBy(group => _.indexOf(groups, group[0].label))
                .flatten()
                .value();
        }
    }

    onSelectGroup(newGroup) {
        this.setState({
            selectedGroup: newGroup,
        });
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
            options,
            sourceLabel,
            selectedLabel,
            onValueChange,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        const groups = this.getSourceGroups();
        const groupOptions = _.map(groups, group => {
            return {
                label: group,
                value: group,
            };
        });
        const selectedGroup = this.getSelectedGroup();

        return (
            <div
                className={ style.duallist }
                data-anchor={ this.getDataAnchor() }
                data-type={ this.getTypeName() }
                data-name={ name }
            >
                {
                    variant !== 'label-removed' ?
                    <h3 className={ window.$Utils.classnames(
                        'slds-text',
                        {
                            'slds-assistive-text': variant === 'label-hidden',
                        }
                        ) }>
                        { label }
                        { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                        { tooltip ? <Helptext content={ tooltip } className="slds-m-left_xx-small"></Helptext> : null }
                    </h3>
                    : null
                }
                {
                    _.size(groups) > 1 && (
                    <RadioGroup name="groups" label="Groups" variant="label-removed" style="button" options={ groupOptions } value={ selectedGroup } onValueChange={ this.onSelectGroup.bind(this) }></RadioGroup>
                    )
                }
                <div className="slds-dueling-list slds-grid slds-wrap" { ...rest }>
                    <div className="slds-assistive-text" id={ id } aria-live="assertive"/>
                    <div className="slds-dueling-list__column">
                        <span className="slds-form-element__label" id={ `${id}-source-list-label` }>
                            { sourceLabel }
                        </span>
                        <div className={ window.$Utils.classnames(
                            'slds-dueling-list__options',
                            {
                                'slds-is-disabled': isDisabled,
                            }
                            ) } role="application">
                            <ul className="slds-listbox slds-listbox_vertical" id={ `${id}-source-list` } aria-labelledby={ `${id}-source-list-label` } aria-multiselectable="true" role="listbox" aria-disabled={ isDisabled }>
                                {
                                    this.getSourceOptions().map((option, index) => {
                                        return (
                                            <li className="slds-listbox__item" role="presentation">
                                                <div className={ window.$Utils.classnames(
                                                    'slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline',
                                                    {
                                                        'slds-is-selected': state.selectedLeft && _.includes(state.selectedIndexes, index),
                                                    }
                                                    ) } aria-selected={ state.selectedLeft && _.includes(state.selectedIndexes, index) } role="option" tabindex="-1" onClick={ e => this.handleOptionClick(e, index, true) }>
                                                    <span className="slds-media__body">
                                                        <span className="slds-truncate" title={ option.label }>
                                                            { option.label }
                                                        </span>
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    <div className="slds-dueling-list__column">
                        <button className="slds-button slds-button_icon slds-button_icon-container" title="right" disabled={ isDisabled } onClick={ e => this.handleRightButtonClick(e) }>
                            <PrimitiveIcon iconName="utility:right" className="slds-button__icon" variant="bare"></PrimitiveIcon>
                            <span className="slds-assistive-text">
                                Right
                            </span>
                        </button>
                        <button className="slds-button slds-button_icon slds-button_icon-container" title="left" disabled={ isDisabled } onClick={ e => this.handleLeftButtonClick(e) }>
                            <PrimitiveIcon iconName="utility:left" className="slds-button__icon" variant="bare"></PrimitiveIcon>
                            <span className="slds-assistive-text">
                                Left
                            </span>
                        </button>
                    </div>
                    <div className="slds-dueling-list__column">
                        <span className="slds-form-element__label" id={ `${id}-selected-list-label` }>
                            { selectedLabel }
                        </span>
                        <div className={ window.$Utils.classnames(
                            'slds-dueling-list__options',
                            {
                                'slds-is-disabled': isDisabled,
                            }
                            ) } role="application">
                            <ul className="slds-listbox slds-listbox_vertical" id={ `${id}-selected-list` } aria-labelledby={ `${id}-selected-list-label` } aria-multiselectable="true" role="listbox" aria-disabled={ isDisabled }>
                                {
                                    this.getSelectedOptions().map((option, index) => {
                                        if(option.isCategory) {
                                            return (
                                                <li className="slds-listbox__item" role="presentation">
                                                    <h3 className="slds-p-around_xx-small slds-text-title_caps">{ option.label }</h3>
                                                </li>
                                            );
                                        }
                                        else {
                                            return (
                                                <li className="slds-listbox__item" role="presentation">
                                                    <div className={ window.$Utils.classnames(
                                                        'slds-listbox__option slds-listbox__option_plain slds-media slds-media_small slds-media_inline',
                                                        {
                                                            'slds-is-selected': !state.selectedLeft && _.includes(state.selectedIndexes, index),
                                                        }
                                                        ) } aria-selected={ !state.selectedLeft && _.includes(state.selectedIndexes, index) } role="option" tabindex="-1" onClick={ e => this.handleOptionClick(e, index, false) }>
                                                        <span className="slds-media__body">
                                                            <span className="slds-truncate" title={ option.label }>
                                                                { option.label }
                                                            </span>
                                                        </span>
                                                        {
                                                            option.locked ?
                                                            <span className="slds-media__figure slds-media__figure_reverse">
                                                                <PrimitiveIcon iconName="utility:lock" size="x-small"></PrimitiveIcon>
                                                            </span>
                                                            : null
                                                        }
                                                    </div>
                                                </li>
                                            );
                                        }
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    {
                        _.size(groups) <= 1 && (
                            <div className="slds-dueling-list__column">
                                <button className="slds-button slds-button_icon slds-button_icon-container" title="up" disabled={ isDisabled } onClick={ e => this.handleUpButtonClick(e) }>
                                    <PrimitiveIcon iconName="utility:up" className="slds-button__icon" variant="bare"></PrimitiveIcon>
                                    <span className="slds-assistive-text">
                                        Up
                                    </span>
                                </button>
                                <button className="slds-button slds-button_icon slds-button_icon-container" title="down" disabled={ isDisabled } onClick={ e => this.handleDownButtonClick(e) }>
                                    <PrimitiveIcon iconName="utility:down" className="slds-button__icon" variant="bare"></PrimitiveIcon>
                                    <span className="slds-assistive-text">
                                        Down
                                    </span>
                                </button>
                            </div>
                        )
                    }
                </div>
                {
                    state.errorMessage ?
                    <div className="slds-has-error">
                        <div className="slds-form-element__help" aria-live="assertive">
                            { state.errorMessage }
                        </div>
                    </div>
                    : null
                }
            </div>
        );
    }
}

DualListbox.propTypes = PropTypes.extend(AbstractField.propTypes, {
    value: PropTypes.isObject('value').defaultValue([]),
    options: PropTypes.isArray('options').required().shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value').required(),
    }),
    sourceLabel: PropTypes.isString('sourceLabel').demoValue('Source'),
    selectedLabel: PropTypes.isString('selectedLabel').demoValue('Selected'),
});

DualListbox.propTypes.name.demoValue('dualListbox');
DualListbox.propTypes.label.demoValue('Dual Listbox');

DualListbox.propTypesRest = true;
DualListbox.displayName = "DualListbox";
