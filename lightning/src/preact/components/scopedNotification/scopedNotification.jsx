import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';

export default class ScopedNotification extends BaseComponent {
    constructor() {
        super();
    }

    render(props, state) {
        const [{
            className,
            variant,
            iconName,
            children,
        }, rest] = this.getPropValues();

        return (
            <div
                className={ window.$Utils.classnames(
                "slds-scoped-notification slds-media slds-media_center",
                {
                    'slds-scoped-notification_light': variant === 'light',
                    'slds-scoped-notification_dark': variant === 'dark',
                },
                className
                ) }
                role="status"
                data-type={ this.getTypeName() }
                { ...rest }
            >
                <div className="slds-media__figure">
                    <span className="slds-icon_container slds-icon-utility-info" title="information">
                        <PrimitiveIcon
                            variant="bare"
                            className="slds-icon slds-icon_small slds-icon-text-default"
                            iconName={ iconName }
                        >
                        </PrimitiveIcon>
                        <span className="slds-assistive-text"></span>
                    </span>
                </div>
                <div className="slds-media__body">
                    { children }
                </div>
            </div>
        );
    }
}

ScopedNotification.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    variant: PropTypes.isString('variant').values([
        'base',
        'light',
        'dark',
    ]).defaultValue('base').demoValue('base'),
    iconName: PropTypes.isString('iconName').defaultValue('utility:info').demoValue('utility:info'),
    children: PropTypes.isChildren('children'),
};

ScopedNotification.propTypesRest = true;
ScopedNotification.displayName = "ScopedNotification";
