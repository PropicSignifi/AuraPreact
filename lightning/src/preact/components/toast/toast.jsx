import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import Portal from 'preact-portal';

export default class Toast extends BaseComponent {
    constructor() {
        super();

        this.state = {
            visible: false,
        };
    }

    isVisible() {
        if(_.isUndefined(this.prop("visible"))) {
            return this.state.visible;
        }
        else {
            return this.prop("visible");
        }
    }

    getIconName() {
        switch(this.prop("variant")) {
            case 'success':
                return "utility:success";
            case 'warning':
                return "utility:warning";
            case 'error':
                return "utility:error";
            default:
                return "utility:info";
        }
    }

    onClose(e) {
        if(_.isFunction(this.prop("onClose"))) {
            this.prop("onClose")(e);
        }

        if(_.isUndefined(this.prop("visible"))) {
            this.setState({
                visible: false,
            });
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(!this.isVisible()) {
            if(nextProps.visible || nextState.visible) {
                window.setTimeout(() => this.onClose(), 5000);
            }
        }
    }

    render(props, state) {
        const [{
            className,
            variant,
            position,
            visible,
            children,
            onClose,
        }, rest] = this.getPropValues();

        return (
            <Portal into="body">
                <div className={ window.$Utils.classnames(
                    'slds-notify_container',
                    {
                        'slds-is-fixed': !position || position === 'fixed',
                        'slds-is-relative': position === 'relative',
                        'slds-hide': !this.isVisible(),
                    },
                    className
                    ) } data-type={ this.getTypeName() } { ...rest }>
                    <div className={ window.$Utils.classnames(
                        'slds-notify slds-notify_toast',
                        {
                            'slds-theme_info': !variant || variant === 'base',
                            'slds-theme_success': variant === 'success',
                            'slds-theme_warning': variant === 'warning',
                            'slds-theme_error': variant === 'error',
                        }
                        ) } role="alert">
                        <span className="slds-assistive-text">{ variant }</span>
                        <PrimitiveIcon variant="bare" iconName={ this.getIconName() } className="slds-icon slds-icon_small slds-m-right_small"></PrimitiveIcon>
                        <div className="slds-notify__content">
                            <h2 className="slds-text-heading_small">{ children }</h2>
                        </div>
                        <button className="slds-button slds-button_icon slds-notify__close slds-button_icon-inverse" title="Close" onClick={ e => this.onClose(e) }>
                            <PrimitiveIcon variant="bare" iconName="utility:close" className="slds-button__icon slds-button__icon_large"></PrimitiveIcon>
                            <span className="slds-assistive-text">Close</span>
                        </button>
                    </div>
                </div>
            </Portal>
        );
    }
}

Toast.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'base',
        'success',
        'warning',
        'error',
    ]).defaultValue('base').demoValue('base'),
    position: PropTypes.isString('position').values([
        'fixed',
        'relative',
    ]).defaultValue('fixed').demoValue('fixed'),
    visible: PropTypes.isBoolean('visible').demoValue(true),
    children: PropTypes.isChildren('children'),
    onClose: PropTypes.isFunction('onClose'),
};

Toast.propTypesRest = true;
Toast.displayName = "Toast";
