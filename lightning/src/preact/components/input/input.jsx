import { h, render, Component } from 'preact';
import AbstractField from '../field/field';
import PropTypes from '../propTypes/propTypes';
import Helptext from '../helptext/helptext';
import { PrimitiveIcon } from '../icon/icon';
import styles from './styles.less';
import { Observable, Subject, } from 'rxjs';

export default class Input extends AbstractField {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            focused: false,
        });

        this.isWaitingForInput = false;
        this.$node = null;

        this.bind([
            'setNode',
        ]);
    }

    setNode(node) {
        this.$node = node;
    }

    focus() {
        this.$node.focus();
    }

    componentDidMount() {
        super.componentDidMount();

        if(!this.subject && this.shouldChangeOnInput()) {
            this.subject = new Subject();
            this.subject.debounceTime(50).subscribe(value => {
                this.setValue(value);
            });
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !this.isWaitingForInput;
    }

    showFormattedNumberEditor() {
        return this.prop('type') === 'formatted-number' && !window.$Utils.isNonDesktopBrowser();
    }

    showFormattedTextEditor() {
        return this.prop('type') === 'text' && this.prop('formatter');
    }

    showFormattedEditor() {
        return this.showFormattedTextEditor() || this.showFormattedNumberEditor();
    }

    setValue(newVal) {
        if(this.showFormattedNumberEditor() && this.prop('parseToNumber')) {
            newVal = !_.isNil(newVal) && newVal !== '' ? _.toNumber(newVal) : newVal;
        }

        if(this.prop('type') === 'number') {
            newVal = !_.isNil(newVal) && newVal !== '' ? _.toNumber(newVal) : newVal;
        }

        super.setValue(newVal);
    }

    onFormattedChange(e) {
        if(_.isFunction(this.prop("onChange"))) {
            this.prop("onChange")(e);
        }
        const newVal = this.parseFormattedValue(e.target.value);
        this.setValue(newVal);
    }

    onChange(e, type) {
        if(this.shouldChangeOnInput()) {
            return;
        }

        if(this.showFormattedEditor()) {
            this.onFormattedChange(e);
        }
        else {
            this.setValue(e.target.value);
        }
    }

    shouldChangeOnInput() {
        return !this.prop("formatter") && this.prop("changeOnInput");
    }

    onInput(e, type) {
        if(!this.shouldChangeOnInput()) {
            return;
        }
        this.isWaitingForInput = true;

        this.subject.next(e.target.value);
    }

    onCheckedChange(e) {
        if(_.isFunction(this.prop("onClick"))) {
            this.prop("onClick")(e);
        }
        const newVal = e.target.checked;
        this.setValue(newVal);
    }

    handleKeyPress(e) {
        if(e.key === 'Backspace') {
            // handle cases for firefox
            return;
        }
        const pos = e.target.selectionStart;
        const raw = (e.target.value || '').split('');
        raw.splice(pos, null, e.key);
        const input = raw.join('');
        if(this.prop("allowedPattern")) {
            if(input && !input.match(this.prop("allowedPattern"))) {
                e.preventDefault();
            }
        }
    }

    onFocus(e, isDisabled) {
        if(isDisabled) {
            return;
        }
        this.setState({
            focused: true,
        });
        if(_.isFunction(this.prop("onFocusIn"))) {
            this.prop("onFocusIn")(e);
        }
    }

    onBlur(e) {
        this.isWaitingForInput = false;
        this.setState({
            focused: false,
        });
        if(_.isFunction(this.prop("onFocusOut"))) {
            this.prop("onFocusOut")(e);
        }
    }

    getFormattedValue(value) {
        const formatter = window.$Formatter.getFormatter(this.prop("formatter"));
        const formatterOptions = window.$Formatter.getFormatterOptions(this.prop("formatter"));

        const options = this.prop("formatter") === 'decimal' ? {
            step: this.prop("step"),
            defaultValue: this.prop("placeholder"),
        } : {};

        if(formatter) {
            return formatter.format(value, formatterOptions || options);
        }

        return value;
    }

    parseFormattedValue(value) {
        const formatter = window.$Formatter.getFormatter(this.prop("formatter"));
        const options = window.$Formatter.getFormatterOptions(this.prop("formatter"));

        if(formatter) {
            return formatter.parse(value, options);
        }

        return value;
    }

    clearAndSetFocusOnInput(e) {
        this.setValue(null);
    }

    computeLabelClassNames() {
        const type = this.prop("type");
        return window.$Utils.classnames(
            'slds-form-element__label',
            {
                'slds-no-flex': type !== 'toggle',
                'slds-m-bottom--none': type === 'toggle',
            }
        );
    }

    renderToggle(props, state, variables) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'is-required': required,
                    'slds-has-error': state.errorMessage,
                    'slds-form--inline': variant === 'label-hidden',
                },
                className
                ) }
                data-anchor={ this.getDataAnchor() }
            >
                <div className="slds-form-element__control">
                    <label className={ window.$Utils.classnames(
                        "slds-checkbox--toggle",
                        {
                            'slds-grid': this.prop('checkStyle') !== 'label',
                        }
                        ) } htmlFor={ id }>
                        <span className={ this.computeLabelClassNames() }>
                            <span className={ window.$Utils.classnames(
                                {
                                    'slds-assistive-text': variant === 'label-hidden',
                                }
                                ) }>
                                { label }
                            </span>
                            { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                            { tooltip ? <Helptext content={ tooltip } isHtml="true" className="slds-m-left_xx-small"></Helptext> : null }
                        </span>
                        <input type="checkbox" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                        <span className="slds-checkbox--faux_container" aria-live="assertive">
                            <span className="slds-checkbox--faux"/>
                            <span className="slds-checkbox--on">
                            </span>
                            <span className="slds-checkbox--off">
                            </span>
                        </span>
                    </label>
                </div>
            </div>
        );
    }

    renderCheckbox(props, state, variables) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'is-required': required,
                    'slds-has-error': state.errorMessage,
                    'slds-form--inline': variant === 'label-hidden',
                    [styles.noLabelCheckboxStyle]: variant === 'label-hidden',
                },
                className
                ) }
                data-anchor={ this.getDataAnchor() }
            >
                <div className="slds-form-element__control">
                    <span className="slds-checkbox">
                        <input type="checkbox" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                        <label className="slds-checkbox__label" htmlFor={ id }>
                            <span className="slds-checkbox--faux slds-m-right_x-small"/>
                            <span className={ this.computeLabelClassNames() }>
                                <span className={ window.$Utils.classnames(
                                    {
                                        'slds-assistive-text': variant === 'label-hidden',
                                    }
                                    ) }>
                                    { label }
                                </span>
                                { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                                { tooltip ? <Helptext content={ tooltip } isHtml="true" className="slds-m-left_xx-small"></Helptext> : null }
                            </span>
                        </label>
                    </span>
                </div>
            </div>
        );
    }

    renderCheckboxButton(props, state, variables) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'is-required': required,
                    'slds-has-error': state.errorMessage,
                    'slds-form--inline': variant === 'label-hidden',
                },
                className
                ) }
                data-anchor={ this.getDataAnchor() }
            >
                <div className="slds-checkbox--add-button">
                    <input className="slds-assistive-text" type="checkbox" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                    <label className="slds-checkbox--faux" htmlFor={ id }>
                        <span className="slds-assistive-text">
                            { label }
                        </span>
                    </label>
                </div>
            </div>
        );
    }

    renderRadioGroupItem(props, state, variables) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        return (
            <div className="slds-button slds-radio_button">
                <input type="radio" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                <label className="slds-radio_button__label" htmlFor={ id }>
                    <span className="slds-radio_faux">
                        { label }
                    </span>
                </label>
            </div>
        );
    }

    renderCheckboxGroupItem(props, state, variables) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        return (
            <div className="slds-button slds-checkbox_button">
                <input type="checkbox" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                <label className="slds-checkbox_button__label" htmlFor={ id }>
                    <span className="slds-checkbox_faux">
                        { label }
                    </span>
                </label>
            </div>
        );
    }

    renderCheckboxFamily(props, state, variables, size, checkStyle) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        let marginLeft, marginTop;
        switch(size) {
            case 'small':
                marginLeft = 'slds-m-left_large';
                marginTop = 'slds-m-top_xx-small';
                break;
            case 'medium':
                marginLeft = 'slds-m-left_x-large';
                marginTop = 'slds-m-top_x-small';
                break;
            case 'big':
                marginLeft = 'slds-m-left_xx-large';
                marginTop = 'slds-m-top_small';
                break;
            default:
                break;
        }

        if(checkStyle === 'label') {
            return (
                <div className={ window.$Utils.classnames(
                    'slds-form-element',
                    {
                        'is-required': required,
                        'slds-has-error': state.errorMessage,
                        'slds-form--inline': variant === 'label-hidden',
                    },
                    className
                    ) }
                    data-anchor={ this.getDataAnchor() }
                >
                    {
                        variant !== 'label-removed' ?
                        <label className="slds-form-element__label slds-form-element__label-has-tooltip" htmlFor={ id }>
                            <span className={ window.$Utils.classnames(
                                {
                                    'slds-assistive-text': variant === 'label-hidden',
                                }
                                ) }>
                                { label }
                            </span>
                            { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                            { tooltip ? <Helptext content={ tooltip } isHtml="true" className="slds-m-left_xx-small"></Helptext> : null }
                        </label>
                        : null
                    }
                    <div className='slds-form-element__control'>
                        <div className={ `slds-checkbox--${size}-button ${styles.root}` }>
                            <input className="slds-assistive-text" type="checkbox" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                            <label className={ window.$Utils.classnames(
                                'slds-checkbox--faux',
                                {
                                    'slds-is-inline-flex slds-grid_vertical-align-center': variant === 'label-hidden',
                                }
                                ) } htmlFor={ id }>
                            </label>
                        </div>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div className={ window.$Utils.classnames(
                    'slds-form-element',
                    {
                        'is-required': required,
                        'slds-has-error': state.errorMessage,
                        'slds-form--inline': variant === 'label-hidden',
                    },
                    className
                    ) }
                    data-anchor={ this.getDataAnchor() }
                >
                    <div className={ `slds-checkbox--${size}-button ${styles.root}` }>
                        <input className="slds-assistive-text" type="checkbox" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                        <label className={ window.$Utils.classnames(
                            'slds-checkbox--faux',
                            {
                                'slds-is-inline-flex slds-grid_vertical-align-center': variant === 'label-hidden',
                            }
                            ) } htmlFor={ id }>
                            <span className={ variant == 'label-hidden' ? 'slds-assistive-text' : `${marginLeft} ${marginTop} slds-text_no-wrap ${styles.transparent}` }>
                                { label }
                            </span>
                        </label>
                        <span className={ variant == 'label-hidden' ? 'slds-hide' : 'slds-m-left_small slds-text_no-wrap' }>
                            { label }
                        </span>
                    </div>
                </div>
            );
        }
    }

    renderRadioFamily(props, state, variables, size) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        let marginLeft, marginTop;
        switch(size) {
            case 'small':
                marginLeft = 'slds-m-left_large';
                marginTop = 'slds-m-top_xx-small';
                break;
            case 'medium':
                marginLeft = 'slds-m-left_x-large';
                marginTop = 'slds-m-top_x-small';
                break;
            case 'big':
                marginLeft = 'slds-m-left_xx-large';
                marginTop = 'slds-m-top_small';
                break;
            default:
                break;
        }

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'is-required': required,
                    'slds-has-error': state.errorMessage,
                    'slds-form--inline': variant === 'label-hidden',
                },
                className
                ) }
                data-anchor={ this.getDataAnchor() }
            >
                <div className={ `slds-radio--${size}-button ${styles.root}` }>
                    <input className="slds-assistive-text" type="radio" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                    <label className={ window.$Utils.classnames(
                        'slds-radio--faux',
                        {
                            'slds-is-inline-flex slds-grid_vertical-align-center': variant === 'label-hidden',
                        }
                        ) } htmlFor={ id }>
                        <span className={ variant == 'label-hidden' ? 'slds-assistive-text' : `${marginLeft} ${marginTop} slds-text_no-wrap ${styles.transparent}` }>
                            { label }
                        </span>
                    </label>
                    <span className={ variant == 'label-hidden' ? 'slds-hide' : 'slds-m-left_small slds-text_no-wrap' }>
                        { label }
                    </span>
                </div>
            </div>
        );
    }

    renderRadio(props, state, variables) {
        const [{
            className,
            variant,
            label,
            required,
            tooltip,
            name,
            value,
        }, rest] = this.getPropValues();

        const {
            id,
            isReadonly,
            isDisabled,
        } = variables;

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'is-required': required,
                    'slds-has-error': state.errorMessage,
                    'slds-form--inline': variant === 'label-hidden',
                    [styles.noLabelRadioStyle]: variant === 'label-hidden',
                },
                className
                ) }
                data-anchor={ this.getDataAnchor() }
            >
                <div className="slds-form-element__control">
                    <span className="slds-radio">
                        <input type="radio" id={ id } name={ name } checked={ value } onClick={ e => this.onCheckedChange(e) } disabled={ isDisabled } readonly={ isReadonly }/>
                        <label className="slds-radio__label" htmlFor={ id }>
                            <span className="slds-radio--faux slds-m-right_x-small"/>
                            <span className={ this.computeLabelClassNames() }>
                                <span className={ window.$Utils.classnames(
                                    {
                                        'slds-assistive-text': variant === 'label-hidden',
                                    }
                                    ) }>
                                    { label }
                                </span>
                                { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                                { tooltip ? <Helptext content={ tooltip } isHtml="true" className="slds-m-left_xx-small"></Helptext> : null }
                            </span>
                        </label>
                    </span>
                </div>
            </div>
        );
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
            type,
            isLoading,
            placeholder,
            formatter,
            allowedPattern,
            addonBefore,
            addonAfter,
            addonStyle,
            style,
            checkStyle,
            iconNameLeft,
            iconNameRight,
            onValueChange,
            labelComponent,
        }, rest] = this.getPropValues();

        window.$Utils.assert(name, "Name is required");
        window.$Utils.assert(label, "Label is required");

        const id = this.id();
        const isDisabled = _.isUndefined(disabled) || _.isNull(disabled) ? state.disabled : disabled;
        const isReadonly = _.isUndefined(readonly) || _.isNull(readonly) ? state.readonly : readonly;

        const formattedValue = this.showFormattedEditor() ? this.getFormattedValue(value) : value;

        const variables = {
            id,
            isDisabled,
            isReadonly,
        };

        switch(type) {
            case 'toggle':
                return this.renderToggle(props, state, variables);
            case 'checkbox':
                return this.renderCheckbox(props, state, variables);
            case 'radio':
                return this.renderRadio(props, state, variables);
            case 'checkbox-button':
                return this.renderCheckboxButton(props, state, variables);
            case 'checkbox-small':
                return this.renderCheckboxFamily(props, state, variables, 'small', checkStyle);
            case 'checkbox-medium':
                return this.renderCheckboxFamily(props, state, variables, 'medium', checkStyle);
            case 'checkbox-big':
                return this.renderCheckboxFamily(props, state, variables, 'big', checkStyle);
            case 'radio-small':
                return this.renderRadioFamily(props, state, variables, 'small');
            case 'radio-medium':
                return this.renderRadioFamily(props, state, variables, 'medium');
            case 'radio-big':
                return this.renderRadioFamily(props, state, variables, 'big');
            case 'radio-group-item':
                return this.renderRadioGroupItem(props, state, variables);
            case 'checkbox-group-item':
                return this.renderCheckboxGroupItem(props, state, variables);
            default:
                break;
        }

        return (
            <div className={ window.$Utils.classnames(
                'slds-form-element',
                {
                    'is-required': required,
                    'slds-has-error': state.errorMessage,
                    'slds-form--inline': variant === 'label-hidden',
                },
                className
                ) }
                data-anchor={ this.getDataAnchor() }
                data-type={ this.getTypeName() }
                data-name={ name }
            >
                {
                    variant !== 'label-removed' ?
                    <label className="slds-form-element__label slds-form-element__label-has-tooltip" htmlFor={ id }>
                        <span className={ window.$Utils.classnames(
                            {
                                'slds-assistive-text': variant === 'label-hidden',
                            }
                            ) }>
                            { label }
                        </span>
                        { required ? <abbr className="slds-required" title="required">*</abbr> : null }
                        { tooltip ? <Helptext content={ tooltip } isHtml="true" className="slds-m-left_xx-small"></Helptext> : null }
                        { labelComponent }
                    </label>
                    : null
                }
                <div className={ window.$Utils.classnames(
                    'slds-form-element__control slds-grow',
                    {
                        'slds-input-has-icon slds-input-has-icon--left-right': (type === 'search' || (iconNameLeft && iconNameRight)),
                        'slds-input-has-icon slds-input-has-icon--left': (type !== 'search' && iconNameLeft),
                        'slds-input-has-icon slds-input-has-icon--right': (type !== 'search' && iconNameRight),
                        'slds-input-has-fixed-addon': addonBefore || addonAfter,
                        'slds-input-tradition': style === 'tradition',
                        'corrected-height': this.showFormattedEditor(),
                    }
                    ) }>
                    {
                        addonBefore && type !== 'search' ?
                        <span className={ window.$Utils.classnames(
                            'slds-form-element__addon addon-before',
                            {
                                [styles.addonStyleBare]: addonStyle === 'bareOnBefore',
                            }
                        ) }>{ addonBefore }</span>
                        : null
                    }
                    <div className={ window.$Utils.classnames(
                        'input-body',
                        {
                            'addon-before': addonBefore,
                            'addon-after': addonAfter,
                        }
                        ) }>
                        <input ref={ this.setNode } className="slds-input" onKeyPress={ e => this.handleKeyPress(e) } type={ this.showFormattedNumberEditor() ? 'text' : (type === 'formatted-number' ? 'number' : type) } id={ id } onInput={ e => this.onInput(e, type) } onChange={ e => this.onChange(e, type) }
                            style={
                                this.showFormattedEditor() ?
                                {
                                    position: 'absolute',
                                    opacity: state.focused ? 1 : 0,
                                }
                                : null
                            }
                            name={ name } value={ formattedValue } placeholder={ placeholder } disabled={ isDisabled } readonly={ isReadonly } onFocus={ e => this.onFocus(e, isDisabled) } onBlur={ e => this.onBlur(e) }
                            min={ type === 'number' ? this.prop('min') : undefined }
                            max={ type === 'number' ? this.prop('max') : undefined }
                            { ...rest }
                        >
                        </input>
                        {
                            this.showFormattedEditor() ?
                            <span className={ window.$Utils.classnames(
                                'slds-input', 'slds-truncate',
                                {
                                    'slds-is-disabled': isDisabled,
                                }
                                ) } aria-hidden="true" style={
                                    {
                                        opacity: state.focused ? 0 : 1,
                                    }
                                }>
                                {  _.defaultTo(formattedValue, placeholder) }
                            </span>
                            : null
                        }
                    </div>
                    {
                        addonAfter && type !== 'search' ?
                        <span className={ window.$Utils.classnames(
                            'slds-form-element__addon addon-after',
                            {
                                [styles.addonStyleBare]: addonStyle === 'bareOnAfter',
                            }
                        ) }>{ addonAfter }</span>
                        : null
                    }
                    {
                        iconNameLeft && type !== 'search' ?
                        <PrimitiveIcon variant="bare" iconName={ iconNameLeft } className="slds-input__icon slds-input__icon--left slds-icon-text-default"></PrimitiveIcon>
                        : null
                    }
                    {
                        iconNameRight && type !== 'search' ?
                        <PrimitiveIcon variant="bare" iconName={ iconNameRight } className="slds-input__icon slds-input__icon--right slds-icon-text-default"></PrimitiveIcon>
                        : null
                    }
                    {
                        type === 'search' ?
                        <PrimitiveIcon variant="bare" iconName="ctc-utility:a_search" className="slds-input__icon slds-input__icon--left slds-icon-text-default"></PrimitiveIcon>
                        : null
                    }
                    {
                        type === 'search' ?
                        <div className="slds-input__icon-group slds-input__icon-group_right">
                            {
                                isLoading ?
                                <div className="slds-spinner slds-spinner_brand slds-spinner--x-small slds-input__spinner" role="status">
                                    <span className="slds-assistive-text">
                                        Loading
                                    </span>
                                    <div className="slds-spinner__dot-a"/>
                                    <div className="slds-spinner__dot-b"/>
                                </div>
                                : null
                            }
                            <button className={ window.$Utils.classnames(
                                'slds-input__icon slds-input__icon--right slds-button slds-button--icon',
                                {
                                    'slds-show': value,
                                    'slds-hide': !value,
                                }
                                ) } onClick={ e => this.clearAndSetFocusOnInput(e) }>
                                <PrimitiveIcon variant="bare" iconName="ctc-utility:a_clear" className="slds-button__icon"></PrimitiveIcon>
                                <span className="slds-assistive-text">
                                    Clear
                                </span>
                            </button>
                        </div>
                        : null
                    }
                </div>
                {
                    state.errorMessage ?
                    <div className="slds-form-element__help" aria-live="assertive">
                        { state.errorMessage }
                    </div>
                    : null
                }
            </div>
        );
    }
}

Input.propTypes = PropTypes.extend(AbstractField.propTypes, {
    type: PropTypes.isString('type').values([
        "checkbox",
        "checkbox-button",
        "color",
        "date",
        "datetime-local",
        "email",
        "month",
        "number",
        "formatted-number",
        "password",
        "radio",
        "range",
        "search",
        "tel",
        "text",
        "time",
        "toggle",
        "url",
        "week",
        "checkbox-big",
        "checkbox-medium",
        "checkbox-small",
        "radio-big",
        "radio-medium",
        "radio-small",
        "radio-group-item",
        "checkbox-group-item",
    ]).defaultValue('text').demoValue('text'),
    isLoading: PropTypes.isBoolean('isLoading').demoValue(false),
    placeholder: PropTypes.isString('placeholder').demoValue(''),
    formatter: PropTypes.isString('formatter').demoValue(''),
    allowedPattern: PropTypes.isString('allowedPattern').demoValue(''),
    addonBefore: PropTypes.isObject('addonBefore').demoValue(''),
    addonAfter: PropTypes.isObject('addonAfter').demoValue(''),
    addonStyle: PropTypes.isString('addonStyle').values([
        "base",
        "bareOnBefore",
        "bareOnAfter",
    ]).defaultValue('base').demoValue('base'),
    style: PropTypes.isString('style').values([
        "base",
        "tradition",
    ]).defaultValue('tradition').demoValue('tradition'),
    iconNameLeft: PropTypes.isIcon('iconNameLeft').demoValue(''),
    iconNameRight: PropTypes.isIcon('iconNameRight').demoValue(''),
    step: PropTypes.isString('step').demoValue(''),
    checkStyle: PropTypes.isString('checkStyle').values([
        'normal',
        'label',
    ]).defaultValue('normal').demoValue('normal'),
    changeOnInput: PropTypes.isBoolean('changeOnInput').demoValue(false),
    parseToNumber: PropTypes.isBoolean('parseToNumber').defaultValue(true).demoValue(true),
    labelComponent: PropTypes.isObject('labelComponent'),
});

Input.propTypes.name.demoValue('input');
Input.propTypes.label.demoValue('Input');
Input.propTypes.min.demoValue(null);
Input.propTypes.max.demoValue(null);
Input.propTypes.minlength.demoValue(null);
Input.propTypes.maxlength.demoValue(null);
Input.propTypes.pattern.demoValue('');

Input.propTypesRest = true;
Input.displayName = "Input";
