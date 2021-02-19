import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';

export default class Notification extends BaseComponent {
    constructor() {
        super();

        this.bind([
            'onClose',
        ]);
    }

    onClose() {
        if(_.isFunction(this.prop('onClose'))) {
            this.prop('onClose')();
        }
    }

    render(props, state) {
        const [{
            className,
            title,
            message,
            content,
        }, rest] = this.getPropValues();

        const id = this.id();

        return (
            <div className={ `slds-notification-container ${className}` } data-type={ this.getTypeName() } { ...rest }>
                <div aria-live="assertive" aria-atomic="true" className="slds-assistive-text">Notification: { title }</div>
                <section className="slds-notification" role="dialog" aria-labelledby={ id } aria-describedby={ `dialog-body-${id}` }>
                    <div className="slds-notification__body" id={ `dialog-body-${id}` }>
                        <a className="slds-notification__target slds-media" href="javascript:void(0);">
                            <span className="slds-icon_container slds-icon-standard-task slds-media__figure" title="notification">
                                <PrimitiveIcon
                                    iconName="standard:custom_notification"
                                    className="slds-icon slds-icon_small"
                                    variant="bare"
                                >
                                </PrimitiveIcon>
                            </span>
                            <div className="slds-media__body">
                                <h2 className="slds-text-heading_small slds-m-bottom_xx-small" id={ id }>
                                    { title }
                                </h2>
                                {
                                    content ? content :
                                    <p className="slds-truncate">{ message }</p>
                                }
                            </div>
                        </a>
                        <button
                            className="slds-button slds-button_icon slds-button_icon-container slds-notification__close"
                            title="Dismiss"
                            onClick={ this.onClose }
                        >
                            <PrimitiveIcon
                                iconName="utility:close"
                                className="slds-button__icon"
                                variant="bare"
                            >
                            </PrimitiveIcon>
                        </button>
                    </div>
                </section>
            </div>
        );
    }
}

Notification.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    title: PropTypes.isString('title').demoValue('Title'),
    message: PropTypes.isString('message').demoValue('message'),
    content: PropTypes.isObject('content'),
    onClose: PropTypes.isFunction('onClose'),
};

Notification.propTypesRest = true;
Notification.displayName = "Notification";
