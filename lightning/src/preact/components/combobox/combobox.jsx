import { h, render, Component } from 'preact';
import AbstractPopupField from '../field/popupField';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Portal from 'preact-portal';
import Utils from '../utils/utils';
import styles from './styles.less';

export default class Combobox extends AbstractPopupField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            focused: false,
            focusedIndex: null,
            value: null,
            values: null,
        });

        this.setLayeredEditorUI = this.setLayeredEditorUI.bind(this);
        this.$input = null;
    }

    setInput(node) {
        this.$input = node;
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.isFunction(this.prop('getValues'))) {
            const p = this.prop('getValues')();
            if(window.$Utils.isPromise(p)) {
                p.then(values => {
                    this.setState({
                        values,
                    });
                }, Utils.catchError);
            }
            else {
                this.setState({
                    values: p,
                });
            }
        }
    }

    onInput(e) {
        this.setState({
            value: e.target.value,
        });
    }

    getValues() {
        return this.state.values || this.prop('values');
    }

    setValue(newVal) {
        super.setValue(newVal);

        this.setState({
            value: null,
        });
    }

    getValue() {
        return this.state.value === null ? this.prop('value') : this.state.value;
    }

    onChange(e) {
        this.setValue(e.target.value);
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
        const placeholder = this.prop('placeholder');
        const label = this.prop('label');

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        return this.state.focused ? (
            <div>
                <div className="slds-combobox_container">
                    <div className={ window.$Utils.classnames(
                        'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click'
                        ) } role="combobox">
                        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
                            <input
                                type="text"
                                className="slds-input slds-combobox__input"
                                autoComplete="off"
                                role="textbox"
                                placeholder={ placeholder }
                                disabled={ isDisabled }
                                value={ this.getValue() }
                                onInput={ this.onInput.bind(this) }
                                onChange={ this.onChange.bind(this) }
                                onFocusIn={ e => this.onFocus(e, isDisabled) }
                            >
                            </input>
                            <span className="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right">
                                <PrimitiveIcon
                                    variant="bare"
                                    className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default"
                                    iconName="ctc-utility:a_search"
                                >
                                </PrimitiveIcon>
                            </span>
                        </div>
                    </div>
                </div>
                <div role="listbox" className={ window.$Utils.classnames(
                    `slds-listbox slds-listbox_vertical slds-is-relative`
                    ) }>
                    <ul className={ this.prop('popupClass') } role="presentation">
                        { _.map(this.getFilteredOptions(), (option, index) => this.getOptionUI(option, index, id)) }
                    </ul>
                </div>
            </div>
        ) : null;
    }

    handleNodeClick(e, option) {
        if(option) {
            this.setState({
                focused: false,
                prompted: false,
                focusedIndex: null,
            });
            this.setValue(option);
        }
    }

    focus() {
        if(this.$input) {
            this.$input.focus();
        }
    }

    hide() {
        this.setState({
            focused: false,
            prompted: false,
            value: null,
            focusedIndex: null,
        });
    }

    getOptionUI(option, index, id) {
        return (
            <li key={ option } role="presentation" className="slds-listbox__item" id={ `${id}-${index}` } onClick={ e => this.handleNodeClick(e, option) }>
                <span id={ `listbox-option-${id}-${index}` } className={ window.$Utils.classnames(
                    'slds-media slds-listbox__option slds-listbox__option_plain slds-media_small slds-media_center',
                    {
                        [styles.focused]: this.state.focusedIndex === index,
                        [styles.hasKeyboardFocus]: this.state.focusedIndex !== null,
                    }
                    ) } role="option">
                    <span className="slds-media__body slds-grid slds-grid_vertical-align-center">
                        <span className="slds-truncate" title={ option }>
                            { option }
                        </span>
                    </span>
                </span>
            </li>
        );
    }

    onFocus(e, isDisabled) {
        if(isDisabled) {
            return;
        }

        this.setState({
            focused: true,
        });

        const value = this.getValue();
        if(_.size(value) >= this.prop('minLetters')) {
            return super.onFocus(e);
        }
    }

    onBlur(e) {
        this.setState({
            focused: false,
            focusedIndex: null,
        });

        return super.onBlur(e);
    }

    getOptions() {
        return this.getValues();
    }

    onKeyDown(e) {
        if(e.keyCode === 38) {
            // Up
            const values = this.getFilteredOptions();
            let nextIndex = this.state.focusedIndex;
            if(nextIndex === null) {
                nextIndex = _.size(values) - 1;
            }
            else if(nextIndex > 0) {
                nextIndex = nextIndex - 1;
            }
            this.setState({
                focusedIndex: nextIndex,
            });
        }
        else if(e.keyCode === 40) {
            // Down
            const values = this.getFilteredOptions();
            let nextIndex = this.state.focusedIndex;
            if(nextIndex === null) {
                nextIndex = 0;
            }
            else if(nextIndex < _.size(values) - 1) {
                nextIndex = nextIndex + 1;
            }
            this.setState({
                focusedIndex: nextIndex,
            });
        }
        else if(e.keyCode === 13) {
            // Enter
            const values = this.getFilteredOptions();
            if(_.size(values) <= 1) {
                return;
            }
            const option = values[this.state.focusedIndex || 0];
            this.handleNodeClick(e, option);
            e.preventDefault();
            if(!_.includes(values, this.getValue())) {
                e.stopPropagation();
            }
        }

        const value = this.getValue();
        if(_.size(value) >= this.prop('minLetters') && !this.isPrompted()) {
            return super.onFocus(e);
        }
    }

    getFilteredOptions() {
        const value = this.getValue();
        if(!value) {
            return this.getOptions();
        }
        else {
            return _.filter(this.getOptions(), option => _.includes(_.toLower(option), _.toLower(value)));
        }
    }

    renderField(props, state, variables) {
        const [{
            className,
            popupClass,
            tooltip,
            name,
            label,
            variant,
            disabled,
            readonly,
            required,
            placeholder,
            width,
            limit,
            onValueChange,
        }, rest] = this.getPropValues();

        const {
            id,
            isDisabled,
            isReadonly,
        } = variables;

        this.setPopupSource(id);

        if(window.$Utils.isNonDesktopBrowser()) {
            this.setLayeredEditorUI(variables);
        }

        const filteredOptions = this.getFilteredOptions();

        return (
            <div className={ window.$Utils.classnames(
                'slds-picklist',
                className,
            ) }>
                <div class="slds-combobox_container">
                    <div className={ window.$Utils.classnames(
                        'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click',
                        {
                            'slds-is-open': this.isPrompted(),
                        }
                        ) } aria-expanded={ this.isPrompted() } aria-haspopup="listbox" role="combobox" data-popup-source={ id }>
                        <div ref={ node => this.setMainInput(node) } className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none" onClick={ e => this.onFocus(e, isDisabled) }>
                            <input
                                ref={ node => this.setInput(node) }
                                type="text"
                                className="slds-input slds-combobox__input"
                                autoComplete="off"
                                role="textbox"
                                placeholder={ placeholder }
                                disabled={ isDisabled }
                                value={ this.getValue() }
                                onKeyDown={ this.onKeyDown.bind(this) }
                                onInput={ this.onInput.bind(this) }
                                onChange={ this.onChange.bind(this) }
                                onFocusIn={ e => this.onFocus(e, isDisabled) }
                                { ...rest }
                            >
                            </input>
                            <span className="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right">
                                <PrimitiveIcon
                                    variant="bare"
                                    className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default"
                                    iconName="ctc-utility:a_search"
                                >
                                </PrimitiveIcon>
                            </span>
                        </div>
                    </div>
                </div>
                <Portal into="body">
                    <div data-popup-source={ id } id={ `listbox-${id}` } role="listbox" className={ window.$Utils.classnames(
                        `slds-listbox slds-listbox_vertical slds-dropdown slds-dropdown_${width} slds-dropdown_custom-picklist slds-dropdown_append-to-body`,
                        {
                            'slds-hide': !this.isPrompted() || _.isEmpty(filteredOptions),
                        },
                        popupClass
                        ) } style={ state.popupStyle }>
                        <ul className={ `slds-dropdown_length-${limit}` } role="presentation">
                            { _.map(filteredOptions, (option, index) => this.getOptionUI(option, index, id)) }
                        </ul>
                    </div>
                </Portal>
            </div>
        );
    }
}

Combobox.propTypes = PropTypes.extend(AbstractPopupField.propTypes, {
    values: PropTypes.isArray('values'),
    getValues: PropTypes.isFunction('getValues'),
    placeholder: PropTypes.isString('placeholder'),
    width: PropTypes.isString('width').values([
        'fluid',
        'xx-small',
        'x-small',
        'small',
        'medium',
        'large',
    ]).defaultValue('fluid').demoValue('fluid'),
    limit: PropTypes.isNumber('limit').defaultValue(5).demoValue(5),
    minLetters: PropTypes.isNumber('minLetters').defaultValue(0).demoValue(0),
});

Combobox.propTypes.name.demoValue('combobox');
Combobox.propTypes.label.demoValue('Combobox');

Combobox.propTypesRest = true;
Combobox.displayName = "Combobox";
