import { h, render, Component } from 'preact';
import AbstractPopupField from '../field/popupField';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Input from '../input/input';
import Pill from '../pill/pill';
import Helptext from '../helptext/helptext';
import Portal from 'preact-portal';
import Utils from '../utils/utils';
import styles from './styles.css';

export default class Picklist extends AbstractPopupField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            style: {
                position: 'absolute',
                opacity: 0,
            },
            searchText: null,
            focused: false,
            options: null,
            loading: false,
            virtualListFirst: 0,
        });

        this.setLayeredEditorUI = this.setLayeredEditorUI.bind(this);
        this.$maxItems = 0;
        this.$maxBuffer = 0;
        this.$bufferRange = 2;
        this.defaultFieldInfo = null;
        this.$options = null;
        this.$dependentPicklistValues = {};
    }

    componentDidMount() {
        super.componentDidMount();

        const configurer = this.prop('configurer');
        if(configurer) {
            if(_.isFunction(configurer.getOptions)) {
                const data = configurer.getOptions(...this.getPropValues());
                if(data.then) {
                    this.setState({
                        loading: true,
                    });

                    data.then(options => {
                        this.setState({
                            options,
                            loading: false,
                        });
                    }, Utils.catchError);
                }
                else if(_.isArray(data)){
                    this.setState({
                        options: data,
                    });
                }
            }
            else if(configurer.fieldInfo) {
                this.getOptionsByRecordName(configurer.fieldInfo);
            }
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(_.get(nextProps.configurer, 'fieldInfo') && !_.isEqual(nextProps.configurer.fieldInfo, this.defaultFieldInfo)) {
            this.getOptionsByRecordName(nextProps.configurer.fieldInfo);
        }
    }

    validate(newVal) {
        if(this.prop('select') === 'multiple' && this.prop('required') && _.isEmpty(newVal)) {
            return `'${this.prop('label')}' is required`;
        }

        return super.validate(newVal);
    }

    getOptionsByRecordName(fieldInfo) {
        const {
            sObjectName,
            fieldName,
            recordId,
            recordTypeName,
            onControllerFieldChanged,
        } = fieldInfo;

        this.defaultFieldInfo = fieldInfo;

        let p = null;
        if(recordTypeName) {
            p = window.$ActionService.DataLightningExtension.invoke('runQuery', {
                query: `SELECT Id FROM RecordType WHERE DeveloperName = '${recordTypeName}' AND SobjectType = '${sObjectName}'`,
            }).then(data => _.get(data, '[0].Id'));
        }
        else if(recordId) {
            p = window.$ActionService.DataLightningExtension.invoke('runQuery', {
                query: `SELECT RecordType.Id FROM ${sObjectName} WHERE Id = '${recordId}'`,
            }).then(data => _.get(data, '[0].RecordType.Id'));
        }
        else {
            return;
        }

        p.then(recordTypeId => {
            const loadDependentPicklistValues = options => {
                if(_.isFunction(onControllerFieldChanged)) {
                    if(!this.$options) {
                        this.$options = options;
                    }
                    return window.$ActionService.DataLightningExtension.invoke('getDependentPicklistValues', {
                        sObjectName,
                        fieldName,
                    }).then(dependentPicklistValues => {
                        this.$dependentPicklistValues = dependentPicklistValues;

                        onControllerFieldChanged(this.prop('name'), newControllerFieldValue => {
                            const key = _.toString(newControllerFieldValue);
                            if(key) {
                                const newOptions = _.chain(this.$dependentPicklistValues[key])
                                    .map(v => _.find(this.$options, ['value', v]))
                                    .compact()
                                    .value();

                                this.setState({
                                    options: newOptions,
                                });
                            }
                            else {
                                this.setState({
                                    options: this.$options,
                                });
                            }
                        });
                    });
                }
                else {
                    return Promise.resolve(null);
                }
            };

            if(recordTypeId) {
                const url = `/services/data/v44.0/ui-api/object-info/${sObjectName}/picklist-values/${recordTypeId}/${fieldName}`;
                const request = {
                    method: 'get',
                    url,
                };

                this.setState({
                    loading: true,
                });

                return Utils.restRequest(this.getPreactContainerName(), request).then(resp => {
                    const options = _.map(resp.values, val => ({ label: val.label, value: val.value }));

                    return loadDependentPicklistValues(options).then(() => {
                        this.setState({
                            options,
                            loading: false,
                        });
                    });
                });
            }
            else {
                this.setState({
                    loading: true,
                });

                return loadDependentPicklistValues(this.getOptions()).then(() => {
                    this.setState({
                        loading: false,
                    });
                });
            }
        });
    }

    isLoading() {
        const configurer = this.prop('configurer');
        return configurer &&
            (_.isFunction(configurer.getOptions) || !!configurer.fieldInfo) &&
            this.state.loading;
    }

    setLayeredEditorUI(variables) {
        if(window.$Utils.isNonDesktopBrowser()) {
            if(_.isFunction(this.context.setLayeredEditorUI)) {
                const ui = this.createLayeredEditor(variables);
                this.context.setLayeredEditorUI(ui, () => {
                    this.setState({
                        focused: false,
                    });
                }, this.id());
            }
        }
    }

    createLayeredEditor(variables) {
        const type = this.prop('type');
        const placeholder = this.prop('placeholder');
        const label = this.prop('label');
        const searchable = this.prop('searchable');
        const style = this.prop('style');
        const iconName = this.prop('iconName');

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        const filteredOptions = this.getFilteredOptions();

        return this.state.focused ? (
            <div>
                {
                    type === 'dropdown' ?
                    <div class="slds-combobox_container">
                        <div className={ window.$Utils.classnames(
                            'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-combobox-picklist'
                            ) } role="combobox">
                            <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                                <div className="picklist-body">
                                    <input type="text" className="slds-input slds-combobox__input" autocomplete="off" role="textbox" placeholder={ placeholder } readonly="true" value={ this.getSelectedLabel() } style={ this.state.style } onFocusIn={ e => this.onFocus(e, isDisabled) }></input>
                                    <span className={ window.$Utils.classnames(
                                        'slds-input slds-truncate',
                                        {
                                            [styles.disabled]: isDisabled,
                                        }
                                        ) }>
                                        { this.getSelectedLabel() || placeholder }
                                    </span>
                                </div>
                                <span className="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right" title="Combobox Trigger">
                                    <PrimitiveIcon variant="bare" iconName={ iconName } className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default"></PrimitiveIcon>
                                    <span className="slds-assistive-text">{ label }</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    :
                    <button className="slds-button slds-button_reset slds-type-focus slds-truncate" disabled={ isDisabled }>
                        <span className="slds-grid slds-has-flexi-truncate slds-grid_vertical-align-center">
                            <span className="slds-truncate" title={ this.getSelectedLabel() || placeholder }>{ this.getSelectedLabel() || placeholder }</span>
                            <span className="slds-icon_container slds-icon-utility-down" title="">
                                <PrimitiveIcon iconName={ iconName } variant="bare" size="x-small" className="slds-m-left_xx-small"></PrimitiveIcon>
                                <span className="slds-assistive-text"></span>
                            </span>
                        </span>
                    </button>
                }
                <div role="listbox" className={ window.$Utils.classnames(
                    `slds-listbox slds-listbox_vertical slds-is-relative`
                    ) }>
                    {
                        searchable ?
                        <Input variant="label-hidden" name="search" label="Search" type="search" className={ `slds-grid slds-m-bottom_xx-small slds-m-right_xx-small ${styles.searchInput}` } value={ this.state.searchText } onValueChange={ newVal => this.setSearchText(newVal) } changeOnInput="true"></Input>
                        : null
                    }
                    <ul className={ this.prop('popupClass') } role="presentation">
                        { _.map(filteredOptions, (option, index) => this.getOptionUI(option, index, style, id)) }
                        <li role="presentation" className={ window.$Utils.classnames(
                            'slds-listbox__item',
                            {
                                'slds-show': _.isEmpty(filteredOptions),
                                'slds-hide': !_.isEmpty(filteredOptions),
                            }
                            ) } id={ `${id}-noResultFound` }>
                            <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-noResultFound` }>
                                <h3 className="slds-text-title_caps" role="presentation">No result found</h3>
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        ) : null;
    }

    getDefaultTotalSelectionLabel(options) {
        const size = _.size(options);
        switch(size) {
            case 0:
                return null;
            case 1:
                return "1 option selected";
            default:
                return `${size} options selected`;
        }
    }

    getSelectedLabel() {
        if(this.prop("select") === 'single' || !this.prop("select")) {
            const selectedOption = _.find(this.getOptions(), ["value", this.prop("value")]);
            return this.prop("configurer") && _.isFunction(this.prop("configurer").getTotalSelectionLabel) ?
                this.prop("configurer").getTotalSelectionLabel(selectedOption) :
                selectedOption && selectedOption.label;
        }
        else {
            const selectedOptions = _.filter(this.getOptions(), option => _.includes(this.prop("value"), option.value));
            return this.prop("configurer") && _.isFunction(this.prop("configurer").getTotalSelectionLabel) ?
                this.prop("configurer").getTotalSelectionLabel(selectedOptions) :
                this.getDefaultTotalSelectionLabel(selectedOptions);
        }
    }

    setSearchText(text) {
        this.setState({
            searchText: text,
        });
    }

    handleNodeClick(e, option) {
        if(option) {
            if(this.prop("select") === 'single' || !this.prop("select")) {
                this.setState({
                    prompted: false,
                    focused: false,
                });

                this.setValue(option.value);
            }
            else {
                if(_.includes(this.prop("value"), option.value)) {
                    this.setValue(_.without(this.prop("value"), option.value));
                }
                else {
                    this.setValue([...(this.prop("value") || []), option.value]);
                }
            }
        }
    }

    isOptionSelected(option) {
        if(this.prop("select") === 'single' || !this.prop("select")) {
            return option.value === this.prop("value");
        }
        else {
            return _.includes(this.prop("value"), option.value);
        }
    }

    getCheckedUI(option, style) {
        switch(style) {
            case 'checkbox':
                return (
                    <Input type="checkbox" variant="label-hidden" name="selected" label="Selected" value={ this.isOptionSelected(option) } readonly="true" className="slds-m-bottom_xxx-small checkbox"></Input>
                );
            case 'checkbutton':
                return (
                    <Input type="checkbox-small" variant="label-hidden" name="selected" label="Selected" value={ this.isOptionSelected(option) } readonly="true" className="checkbutton"></Input>
                );
            default:
                return (
                    <PrimitiveIcon variant="bare" iconName="ctc-utility:a_tick" className="slds-icon slds-icon_x-small slds-listbox__icon-selected"></PrimitiveIcon>
                );
        }
    }

    getOptionUI(option, index, style, id) {
        if(option.isGroupLabel) {
            return (
                <li key={ `${option.label}-${index}` } role="presentation" className="slds-listbox__item" id={ `${id}-${index}` }>
                    <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-${index}` }>
                        <h3 className="slds-text-title_caps" role="presentation">{ option.label }</h3>
                    </span>
                </li>
            );
        }
        else {
            return (
                <li key={ `${option.value}-${index}` } role="presentation" className="slds-listbox__item" id={ `${id}-${index}` } onClick={ e => this.handleNodeClick(e, option) }>
                    <span id={ `listbox-option-${id}-${index}` } className={ window.$Utils.classnames(
                        'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-media_center',
                        {
                            'slds-is-selected': this.isOptionSelected(option),
                        }
                        ) } role="option">
                        <span className="slds-media__figure">
                            { this.getCheckedUI(option, style) }
                        </span>
                        <span className="slds-media__body slds-grid slds-grid_vertical-align-center">
                            <span className={ this.prop('truncateOption') ? 'slds-truncate' : '' } title={ option.label }>
                                { option.label }
                            </span>
                            {
                                option.tooltip && (
                                <Helptext content={ option.tooltip } align="bottom-left" iconName="ctc-utility:info_info" isHtml="false">
                                </Helptext>
                                )
                            }
                        </span>
                    </span>
                </li>
            );
        }
    }

    createVirtualListItems(filteredOptions, style, id) {
        return _.chain(filteredOptions)
            .slice(this.state.virtualListFirst, this.state.virtualListFirst + this.$maxItems * 2)
            .map((option, index) => this.getVirtualListOptionUI(option, this.state.virtualListFirst + index, style, id))
            .value();
    }

    onScroll(e) {
        if(this.isVirtualList()) {
            const scrollTop = e.target.scrollTop;
            const first = parseInt(scrollTop / this.prop('dropdownItemHeight')) - this.$maxItems;
            this.setState({
                virtualListFirst: first < 0 ? 0 : first,
            });

            e.preventDefault && e.preventDefault();
        }
    }

    getVirtualListOptionUI(option, index, style, id) {
        const dropdownItemHeight = this.prop('dropdownItemHeight');

        const optionStyle = {
            position: 'absolute',
            height: dropdownItemHeight + 'px',
            top: dropdownItemHeight * index + 'px',
            left: 0,
            right: 0,
        };

        if(option.isGroupLabel) {
            return (
                <div key={ `${option.label}-${index}` } role="presentation" className="slds-listbox__item" id={ `${id}-${index}` } style={ optionStyle }>
                    <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-${index}` }>
                        <h3 className="slds-text-title_caps" role="presentation">{ option.label }</h3>
                    </span>
                </div>
            );
        }
        else {
            return (
                <div key={ `${option.value}-${index}` } role="presentation" className="slds-listbox__item" id={ `${id}-${index}` } onClick={ e => this.handleNodeClick(e, option) } style={ optionStyle }>
                    <span id={ `listbox-option-${id}-${index}` } className={ window.$Utils.classnames(
                        'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-media_center',
                        {
                            'slds-is-selected': this.isOptionSelected(option),
                        }
                        ) } role="option">
                        <span className="slds-media__figure">
                            { this.getCheckedUI(option, style) }
                        </span>
                        <span className="slds-media__body slds-grid slds-grid_vertical-align-center">
                            <span className={ this.prop('truncateOption') ? 'slds-truncate' : '' } title={ option.label }>
                                { option.label }
                            </span>
                            {
                                option.tooltip && (
                                <Helptext content={ option.tooltip } align="bottom-left" iconName="ctc-utility:info_info" isHtml="false">
                                </Helptext>
                                )
                            }
                        </span>
                    </span>
                </div>
            );
        }
    }

    onRemovePill(index, isDisabled) {
        if(isDisabled) {
            return;
        }

        const newVal = _.without(this.prop("value"), this.prop("value")[index]);
        this.setValue(newVal);
    }

    getPills() {
        return _.chain(this.prop('value'))
            .map(value => _.find(this.getOptions(), ['value', value]))
            .compact()
            .value();
    }

    onFocus(e, isDisabled) {
        if(isDisabled) {
            return;
        }

        this.setState({
            focused: true,
        });

        if(this.isPrompted()) {
            return this.onBlur(e);
        }
        else {
            return super.onFocus(e);
        }
    }

    isPrompted() {
        if(this.prop('forceOnMobile')) {
            return this.state.prompted;
        }
        else {
            return super.isPrompted();
        }
    }

    onBlur(e) {
        this.setState({
            focused: false,
        });

        return super.onBlur(e);
    }

    getOptions() {
        const options = this.state.options || this.prop('options') || [];
        const ret = !this.prop('required') && this.prop('select') === 'single' ? [
            {
                label: this.prop('placeholder') || '-- Please Select --',
                value: null,
            },
            ...options,
        ] : options;
        return ret;
    }

    getFilteredOptions() {
        return _.filter(this.getOptions(), option => _.includes(_.toLower(option.label), _.toLower(this.state.searchText)));
    }

    isSimplePicklist() {
        return this.prop('style') === 'base' &&
            this.prop('select') === 'single' &&
            this.prop('type') === 'dropdown' &&
            !this.prop('forceAdvancedPicklist') &&
            !this.prop('searchable');
    }

    isVirtualList() {
        return this.prop('dropdownHeight') && this.prop('dropdownItemHeight');
    }

    getPopupStyle() {
        const style = this.state.popupStyle;
        if(this.isVirtualList()) {
            return _.assign({}, style, {
                height: this.prop('dropdownHeight') + 'px',
                overflow: 'auto',
            });
        }
        else {
            return style;
        }
    }

    createVirtualListScroller(options) {
        const style = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1px',
            height: _.size(options) * this.prop('dropdownItemHeight') + 'px',
        };

        return this.isVirtualList() && (
            <div style={ style }>
            </div>
        );
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
            placeholder,
            hidePills,
            select,
            style,
            type,
            width,
            limit,
            searchable,
            configurer,
            dropdownHeight,
            dropdownItemHeight,
            iconName,
            onValueChange,
            forceOnMobile,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        this.setPopupSource(id);

        if(window.$Utils.isNonDesktopBrowser() && !forceOnMobile) {
            if(this.isSimplePicklist()) {
                return (
                    <div class="slds-select_container">
                        <select class="slds-select" id={ id } disabled={ isDisabled } readOnly={ isReadonly } onchange={ e => this.setValue(e.target.value) }>
                            {
                                this.prop('required') &&
                                <option value="">-- Please Select --</option>
                            }
                            {
                                _.map(this.getOptions(), (option, key) => {
                                    return (
                                        <option key={ key } value={ option.value } selected={ option.value === value }>{ option.label }</option>
                                    );
                                })
                            }
                        </select>
                    </div>
                );
            }
            else {
                this.setLayeredEditorUI(variables);
            }
        }

        const filteredOptions = this.getFilteredOptions();

        if(this.isVirtualList()) {
            this.$maxItems = _.ceil(dropdownHeight / dropdownItemHeight) * this.$bufferRange;
            this.$maxBuffer = this.$maxItems * dropdownItemHeight;
        }

        return (
            <div className="slds-picklist">
                {
                    type === 'dropdown' ?
                    <div class="slds-combobox_container">
                        <div className={ window.$Utils.classnames(
                            'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-combobox-picklist',
                            {
                                'slds-is-open': this.isPrompted(),
                            }
                            ) } aria-expanded={ this.isPrompted() } aria-haspopup="listbox" role="combobox" data-popup-source={ id }>
                            <div ref={ node => this.setMainInput(node) } className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none" onClick={ e => this.onFocus(e, isDisabled) }>
                                <div className="picklist-body">
                                    <input type="text" className="slds-input slds-combobox__input" id={ id } aria-controls={ `listbox-${id}` } autocomplete="off" role="textbox" placeholder={ placeholder } disabled={ isDisabled } readonly="true" value={ this.getSelectedLabel() } style={ state.style }></input>
                                    <span className={ window.$Utils.classnames(
                                        'slds-input slds-truncate',
                                        {
                                            [styles.disabled]: isDisabled,
                                        }
                                        ) }>
                                        { this.getSelectedLabel() || placeholder }
                                    </span>
                                </div>
                                <span className="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right" title="Combobox Trigger">
                                    <PrimitiveIcon variant="bare" iconName={ iconName } className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default"></PrimitiveIcon>
                                    <span className="slds-assistive-text">{ label }</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    :
                    <button ref={ node => this.setMainInput(node) } data-popup-source={ id } className="slds-button slds-button_reset slds-type-focus slds-truncate" aria-haspopup="true" disabled={ isDisabled } onClick={ e => this.onFocus(e, isDisabled) }>
                        <span className="slds-grid slds-has-flexi-truncate slds-grid_vertical-align-center">
                            <span className="slds-truncate" title={ this.getSelectedLabel() || placeholder }>{ this.getSelectedLabel() || placeholder }</span>
                            <span className="slds-icon_container slds-icon-utility-down" title="">
                                <PrimitiveIcon iconName={ iconName } variant="bare" size="x-small" className="slds-m-left_xx-small"></PrimitiveIcon>
                                <span className="slds-assistive-text"></span>
                            </span>
                        </span>
                    </button>
                }
                <Portal into="body">
                    <div data-popup-source={ id } id={ `listbox-${id}` } role="listbox" className={ window.$Utils.classnames(
                        `slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_${width} slds-dropdown_custom-picklist slds-dropdown_append-to-body`,
                        {
                            'slds-hide': !this.isPrompted(),
                            },
                            popupClass
                        ) } style={ this.getPopupStyle() } onScroll={ this.onScroll.bind(this) }>
                        { this.createVirtualListScroller(filteredOptions) }
                        {
                            searchable ?
                            <Input variant="label-hidden" name="search" label="Search" type="search" className={ `slds-grid slds-m-bottom_xx-small slds-m-right_xx-small ${styles.searchInput}` } value={ state.searchText } onValueChange={ newVal => this.setSearchText(newVal) } changeOnInput="true"></Input>
                            : null
                        }
                        {
                            this.isVirtualList() ?
                            this.createVirtualListItems(filteredOptions, style, id)
                            :
                            <ul className={ `slds-dropdown_length-${limit}` } role="presentation">
                                { _.map(filteredOptions, (option, index) => this.getOptionUI(option, index, style, id)) }
                                <li role="presentation" className={ window.$Utils.classnames(
                                    'slds-listbox__item',
                                    {
                                        'slds-show': this.isLoading(),
                                        'slds-hide': !this.isLoading(),
                                    }
                                    ) } id={ `${id}-noResultFound` }>
                                    <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-loading` }>
                                        <h3 className="slds-text-title_caps" role="presentation">Loading ...</h3>
                                    </span>
                                </li>
                                <li role="presentation" className={ window.$Utils.classnames(
                                    'slds-listbox__item',
                                    {
                                        'slds-show': _.isEmpty(filteredOptions) && !this.isLoading(),
                                        'slds-hide': !_.isEmpty(filteredOptions) || this.isLoading(),
                                    }
                                    ) } id={ `${id}-noResultFound` }>
                                    <span className="slds-media slds-listbox__option slds-listbox__option_plain" role="presentation" id={ `listbox-option-${id}-noResultFound` }>
                                        <h3 className="slds-text-title_caps" role="presentation">No result found</h3>
                                    </span>
                                </li>
                            </ul>
                        }
                    </div>
                </Portal>
                {
                    select === 'multiple' && !hidePills && !_.isEmpty(this.getPills()) ?
                    <div id={ `listbox-selected-${id}` } role="listbox" aria-orientation="horizontal">
                        <ul className="slds-listbox slds-listbox_horizontal slds-p-top_xxx-small" role="group" aria-label="Selected Options:">
                            { _.map(this.getPills(), (pill, index) => {
                                return (
                                <li key={ `${pill.value}-${index}` } role="presentation" className="slds-listbox__item">
                                    <Pill name={ pill.value } label={ pill.label } onRemove={ e => this.onRemovePill(index, isDisabled) }></Pill>
                                </li>
                                );
                            }) }
                        </ul>
                    </div>
                    : null
                }
            </div>
        );
    }
}

Picklist.propTypes = PropTypes.extend(AbstractPopupField.propTypes, {
    options: PropTypes.isArray('options').shape({
        label: PropTypes.isString('label').required(),
        value: PropTypes.isObject('value'),
        isGroupLabel: PropTypes.isBoolean('isGroupLabel'),
    }),
    placeholder: PropTypes.isString('placeholder').defaultValue('-- Please Select --').demoValue('-- Please Select --'),
    hidePills: PropTypes.isBoolean('hidePills').demoValue(false),
    select: PropTypes.isString('select').values([
        'single',
        'multiple',
    ]).defaultValue('single').demoValue('single'),
    style: PropTypes.isString('style').values([
        'base',
        'checkbox',
        'checkbutton',
    ]).defaultValue('base').demoValue('base'),
    type: PropTypes.isString('type').values([
        'dropdown',
        'link',
    ]).defaultValue('dropdown').demoValue('dropdown'),
    width: PropTypes.isString('width').values([
        'fluid',
        'xx-small',
        'x-small',
        'small',
        'medium',
        'large',
    ]).defaultValue('fluid').demoValue('fluid'),
    limit: PropTypes.isNumber('limit').defaultValue(5).demoValue(5),
    searchable: PropTypes.isBoolean('searchable').demoValue(false),
    configurer: PropTypes.isObject('configurer').shape({
        getTotalSelectionLabel: PropTypes.isFunction('getTotalSelectionLabel'),
        getOptions: PropTypes.isFunction('getOptions'),
        fieldInfo: PropTypes.isObject('fieldInfo').shape({
            sObjectName: PropTypes.isString('sObjectName').required(),
            fieldName: PropTypes.isString('fieldName').required(),
            recordId: PropTypes.isString('recordId'),
            recordTypeName: PropTypes.isString('recordTypeName'),
            onControllerFieldChanged: PropTypes.isFunction('onControllerFieldChanged'),
        }),
    }),
    dropdownHeight: PropTypes.isNumber('dropdownHeight').description('The height of the dropdown in a virtual list').demoValue(''),
    dropdownItemHeight: PropTypes.isNumber('dropdownItemHeight').description('The height of the dropdown item in a virtual list').demoValue(''),
    forceAdvancedPicklist: PropTypes.isBoolean('forceAdvancedPicklist').defaultValue(false).demoValue(false),
    truncateOption: PropTypes.isBoolean('truncateOption').defaultValue(true).demoValue(true),
    iconName: PropTypes.isString('iconName').defaultValue("utility:down"),
    forceOnMobile: PropTypes.isBoolean('forceOnMobile'),
});

Picklist.propTypes.name.demoValue('picklist');
Picklist.propTypes.label.demoValue('Picklist');

Picklist.propTypesRest = true;
Picklist.displayName = "Picklist";
