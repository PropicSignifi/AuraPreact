import { h, render, Component } from 'preact';
import AbstractSimplePopupComponent from '../base/simplePopupComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Portal from 'preact-portal';

export default class ButtonMenu extends AbstractSimplePopupComponent {
    constructor() {
        super();
    }

    onSelect(newVal) {
        if(_.isFunction(this.prop("onSelect"))) {
            this.prop("onSelect")(newVal);
        }
        this.setState({
            prompted: false,
        });
    }

    getChildContext(context) {
        return _.assign({}, super.getChildContext(context), {
            onSelect: this.onSelect.bind(this),
        });
    }

    getButtonClassName() {
        const variant = this.prop("variant") || "border";
        const size = this.prop("iconSize") || "medium";
        const isDropdownIcon = !!this.prop("iconName");
        const isBare = variant.split("-")[0] === "bare";

        if(this.prop('label')) {
            const computedClassNames = window.$Utils.classnames("slds-button", {
                'slds-button--neutral': variant === 'neutral',
                'slds-button--brand': variant === 'brand',
                'slds-button--destructive': variant === 'destructive',
                'slds-button--inverse': variant === 'inverse',
                'slds-button--success': variant === 'success',
                'slds-button_primary': variant === 'primary',
                'slds-button_secondary': variant === 'secondary',
                'slds-button_tertiary': variant === 'tertiary',
                'slds-button_save': variant === 'save',
                'slds-text-link_reset': variant === 'reset',
            });
            return computedClassNames;
        }
        else {
            const computedClassNames = window.$Utils.classnames("slds-button", {
                "slds-button--icon": !isDropdownIcon,
                "slds-button--icon-bare": isBare,
                "slds-button--icon-more": variant !== "container" && !isDropdownIcon,
                "slds-button--icon-container-more": variant === "container" && !isDropdownIcon,
                "slds-button--icon-container": variant === "container" && isDropdownIcon,
                "slds-button--icon-border": variant === "border" && isDropdownIcon,
                "slds-button--icon-border-filled": variant === "border-filled",
                "slds-button--icon-border-inverse": variant === "border-inverse",
                "slds-button--icon-inverse": variant === "bare-inverse",
                "slds-button--icon-xx-small": size === "xx-small" && !isBare,
                "slds-button--icon-x-small": size === "x-small" && !isBare,
                "slds-button--icon-small": size === "small" && !isBare,
            });
            return computedClassNames;
        }
    }

    getDropdownClassName() {
        const dropdownAlignment = this.prop("menuAlignment") || "left";
        const classnames = window.$Utils.classnames("slds-dropdown", {
            "slds-dropdown--left": dropdownAlignment === "left",
            "slds-dropdown--center": dropdownAlignment === "center",
            "slds-dropdown--right": dropdownAlignment === "right",
            "slds-dropdown--bottom": dropdownAlignment === "bottom-center",
            "slds-dropdown--bottom slds-dropdown--right slds-dropdown--bottom-right": dropdownAlignment === "bottom-right",
            "slds-dropdown--bottom slds-dropdown--left slds-dropdown--bottom-left": dropdownAlignment === "bottom-left"
        }, {
            'slds-hide': this.canAppendToBody() && !this.isPrompted(),
        }, this.prop('popupClass'));
        return classnames;
    }

    canAppendToBody() {
        return this.prop('menuAlignment') === 'left' || this.prop('menuAlignment') === 'right';
    }

    computePopupStyle(pos, elem) {
        const popupStyle = {
            position: "absolute",
            right: pos.right + "px",
            top: pos.top + elem.getBoundingClientRect().height + "px",
        };

        if(this.prop('menuAlignment') === 'left') {
            popupStyle.left = pos.left + "px";
        }

        return popupStyle;
    }

    onFocus(e) {
        if(this.isPrompted()) {
            return super.onBlur(e);
        }
        else {
            return super.onFocus(e);
        }
    }

    render(props, state) {
        const [{
            className,
            tooltip,
            label,
            variant,
            menuAlignment,
            iconName,
            iconSize,
            alternativeText,
            disabled,
            name,
            value,
            onSelect,
            children,
        }, rest] = this.getPropValues();

        const id = this.id();

        this.setPopupSource(id);

        return (
            <div
                className={ window.$Utils.classnames(
                'slds-dropdown-trigger slds-dropdown-trigger_click',
                {
                    'slds-is-open': state.prompted,
                },
                className
                ) }
                data-type={ this.getTypeName() }
                data-name={ name }
                { ...rest }
            >
                <button ref={ node => this.setMainInput(node) } data-popup-source={ id } className={ this.getButtonClassName() } name={ name } disabled={ disabled } aria-expanded={ state.prompted } value={ value } aria-haspopup="true" onClick={ e => this.onFocus(e) }>
                    { label }
                    <PrimitiveIcon variant="bare" iconName={ iconName } className={ `slds-button__icon ${label ? 'slds-button__icon--right' : ''}` }></PrimitiveIcon>
                    <span className="slds-assistive-text">
                        { alternativeText }
                    </span>
                </button>
                {
                    this.canAppendToBody() ?
                    <Portal into="body">
                        <div data-popup-source={ id } className={ this.getDropdownClassName() } style={ state.popupStyle }>
                            <ul className="dropdown__list" role="menu">
                                { children }
                            </ul>
                        </div>
                    </Portal>
                    :
                    <div data-popup-source={ id } className={ this.getDropdownClassName() }>
                        <ul className="dropdown__list" role="menu">
                            { children }
                        </ul>
                    </div>
                }
            </div>
        );
    }
}

ButtonMenu.propTypes = PropTypes.extend(AbstractSimplePopupComponent.propTypes, {
    className: PropTypes.isString('className').demoValue(''),
    tooltip: PropTypes.isString('tooltip').demoValue(''),
    label: PropTypes.isString('label').demoValue(''),
    variant: PropTypes.isString('variant').values([
        "bare",
        "container",
        "border",
        "border-filled",
        "bare-inverse",
        "border-inverse",
        "neutral",
        "brand",
        "destructive",
        "inverse",
        "success",
        "primary",
        "secondary",
        "tertiary",
        "save",
        "reset",
    ]).defaultValue('bare').demoValue('border'),
    menuAlignment: PropTypes.isString('menuAlignment').values([
        "left",
        "center",
        "right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
    ]).defaultValue('left').demoValue('left'),
    iconName: PropTypes.isIcon('iconName').defaultValue('ctc-utility:a_down').demoValue('ctc-utility:a_down'),
    iconSize: PropTypes.isString('iconSize').values([
        "xx-small",
        "x-small",
        "medium",
        "large",
    ]).defaultValue('medium').demoValue('medium'),
    alternativeText: PropTypes.isString('alternativeText').demoValue(''),
    disabled: PropTypes.isBoolean('disabled').demoValue(false),
    name: PropTypes.isString('name').demoValue('buttonMenu'),
    value: PropTypes.isString('value').demoValue('value'),
    onSelect: PropTypes.isFunction('onSelect'),
    children: PropTypes.isChildren('children'),
});

ButtonMenu.propTypesRest = true;
ButtonMenu.displayName = "ButtonMenu";
