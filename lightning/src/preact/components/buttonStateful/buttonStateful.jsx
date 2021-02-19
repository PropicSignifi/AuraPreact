import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Helptext from '../helptext/helptext';

export default class ButtonStateful extends BaseComponent {
    constructor() {
        super();

        this.state = {
            isClicked: false,
            state: false,
        };
    }

    onClicked(e) {
        if(_.isFunction(this.prop("onClick"))) {
            this.prop("onClick")(!this.prop("state"));
        }
        if(!_.isBoolean(this.prop("state"))) {
            this.setState({
                isClicked: true,
                state: !this.state.state,
            });
        }
        else {
            this.setState({
                isClicked: true,
            });
        }
    }

    getIconClass() {
        return window.$Utils.classnames(
            'slds-button__icon--stateful',
            `slds-button__icon--${this.prop('iconPosition')}`,
            `slds-button__icon_${this.prop('iconSize')}`
        );
    }

    render(props, compState) {
        const [{
            className,
            tooltip,
            state,
            labelWhenOff,
            labelWhenOn,
            labelWhenHover,
            iconNameWhenOff,
            iconNameWhenOn,
            iconNameWhenHover,
            classNameWhenOff,
            classNameWhenOn,
            classNameWhenHover,
            variant,
            iconPosition,
            onClick,
        }, rest] = this.getPropValues();

        const realState = _.isBoolean(state) ? state : compState.state;

        return (
            <button className={ window.$Utils.classnames(
                'slds-button slds-button--stateful',
                {
                    'slds-button--neutral': variant === 'neutral',
                    'slds-button--brand': variant === 'brand',
                    'slds-button--inverse': variant === 'inverse',
                    'slds-button--reset': variant === 'reset',
                    'slds-button--destructive': variant === 'destructive',
                    'slds-button--success': variant === 'success',
                    'slds-button_primary': variant === 'primary',
                    'slds-button_secondary': variant === 'secondary',
                    'slds-button_tertiary': variant === 'tertiary',
                    'slds-button_save': variant === 'save',
                },
                {
                    [`slds-not-selected ${classNameWhenOff}`]: !realState,
                    [`slds-is-selected ${classNameWhenHover}`]: realState && !compState.isClicked,
                    [`slds-is-selected-clicked ${classNameWhenOn}`]: realState && compState.isClicked,
                },
                className
            ) } onClick={ e => this.onClicked(e) } data-type={ this.getTypeName() } { ...rest }>
                <span className="slds-text-not-selected">
                    { iconNameWhenOff && iconPosition === 'left' ? <PrimitiveIcon variant="bare" iconName={ iconNameWhenOff } className={ this.getIconClass() }/> : null }
                    { labelWhenOff }
                    { iconNameWhenOff && iconPosition === 'right' ? <PrimitiveIcon variant="bare" iconName={ iconNameWhenOff } className={ this.getIconClass() }/> : null }
                    { tooltip ? <Helptext content={ tooltip } className="slds-m-left_x-small"/> : null }
                </span>
                <span className="slds-text-selected">
                    { iconNameWhenOn && iconPosition === 'left' ? <PrimitiveIcon variant="bare" iconName={ iconNameWhenOn } className={ this.getIconClass() }/> : null }
                    { labelWhenOn }
                    { iconNameWhenOn && iconPosition === 'right' ? <PrimitiveIcon variant="bare" iconName={ iconNameWhenOn } className={ this.getIconClass() }/> : null }
                    { tooltip ? <Helptext content={ tooltip } className="slds-m-left_x-small"/> : null }
                </span>
                <span className="slds-text-selected-focus">
                    { iconNameWhenHover && iconPosition === 'left' ? <PrimitiveIcon variant="bare" iconName={ iconNameWhenHover } className={ this.getIconClass() }/> : null }
                    { labelWhenHover }
                    { iconNameWhenHover && iconPosition === 'right' ? <PrimitiveIcon variant="bare" iconName={ iconNameWhenHover } className={ this.getIconClass() }/> : null }
                    { tooltip ? <Helptext content={ tooltip } className="slds-m-left_x-small"/> : null }
                </span>
            </button>
        );
    }
}

ButtonStateful.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    tooltip: PropTypes.isString('tooltip').demoValue(''),
    state: PropTypes.isBoolean('state').demoValue(false),
    labelWhenOff: PropTypes.isString('labelWhenOff').demoValue('Off'),
    labelWhenOn: PropTypes.isString('labelWhenOn').demoValue('On'),
    labelWhenHover: PropTypes.isString('labelWhenHover').demoValue(''),
    iconNameWhenOff: PropTypes.isIcon('iconNameWhenOff').demoValue(''),
    iconNameWhenOn: PropTypes.isIcon('iconNameWhenOn').demoValue(''),
    iconNameWhenHover: PropTypes.isIcon('iconNameWhenHover').demoValue(''),
    classNameWhenOff: PropTypes.isIcon('classNameWhenOff').demoValue(''),
    classNameWhenOn: PropTypes.isIcon('classNameWhenOn').demoValue(''),
    classNameWhenHover: PropTypes.isIcon('classNameWhenHover').demoValue(''),
    variant: PropTypes.isString('variant').values([
        "neutral",
        "brand",
        "inverse",
        "reset",
        "destructive",
        "success",
        "primary",
        "secondary",
        "tertiary",
        "save",
    ]).defaultValue('tertiary').demoValue('tertiary'),
    iconPosition: PropTypes.isString('iconPosition').values([
        "left",
        "right",
    ]).defaultValue('left').demoValue('left'),
    iconSize: PropTypes.isString('iconSize').values([
        "large",
        "medium",
        "small",
        "x-small",
        "xx-small",
    ]).defaultValue('small').demoValue('small'),
    onClick: PropTypes.isFunction('onClick'),
};

ButtonStateful.propTypesRest = true;
ButtonStateful.displayName = "ButtonStateful";
