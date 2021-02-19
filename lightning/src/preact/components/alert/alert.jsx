import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';

export default class Alert extends BaseComponent {
    constructor() {
        super();

        this.state = {
            closed: false,
        };
    }

    isClosed() {
        if(_.isUndefined(this.prop("closed"))) {
            return this.state.closed;
        }
        else {
            return this.prop("closed");
        }
    }

    onClose(e) {
        if(_.isFunction(this.prop("onClose"))) {
            this.prop("onClose")(e);
        }

        if(_.isUndefined(this.prop("closed"))) {
            this.setState({
                closed: true,
            });
        }
    }

    render(props, state) {
        const [{
            className,
            variant,
            closeable,
            closed,
            onClose,
            children,
        }, rest] = this.getPropValues();

        return (
            <div className={ window.$Utils.classnames(
                'slds-notify slds-notify_alert slds-theme_alert-texture',
                {
                    'slds-theme_info': !variant || variant === 'info',
                    'slds-theme_warning': variant === 'warning',
                    'slds-theme_error': variant === 'error',
                    'slds-hide': this.isClosed(),
                },
                className
                ) } role="alert" data-type={ this.getTypeName() } { ...rest }>
                <span className="slds-assistive-text">{ variant }</span>
                <PrimitiveIcon variant="bare" iconName={ `utility:${variant}` } className="slds-icon slds-icon_x-small slds-m-right_x-small"></PrimitiveIcon>
                { children }
                {
                    closeable ?
                    <button className="slds-button slds-button_icon slds-notify__close slds-button_icon-inverse" title="Close" onClick={ e => this.onClose(e) }>
                        <PrimitiveIcon variant="bare" iconName="utility:close" className="slds-button__icon"></PrimitiveIcon>
                        <span className="slds-assistive-text">Close</span>
                    </button>
                    : null
                }
            </div>
        );
    }
}

Alert.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'info',
        'warning',
        'error',
    ]).defaultValue('info').demoValue('info'),
    closeable: PropTypes.isBoolean('closeable').defaultValue(true).demoValue(true),
    closed: PropTypes.isBoolean('closed').demoValue(false),
    onClose: PropTypes.isFunction('onClose'),
    children: PropTypes.isChildren('children'),
};

Alert.propTypesRest = true;
Alert.displayName = "Alert";
