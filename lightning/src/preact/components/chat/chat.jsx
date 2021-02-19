import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import { PrimitiveIcon } from '../icon/icon';
import styles from './chat.less';

const ItemType = {
    Inbound: 'inbound',
    Outbound: 'outbound',
    Error: 'error',
};

export default class Chat extends BaseComponent {
    constructor() {
        super();

        this.bind([
            'renderItem',
        ]);
    }

    renderInboundContent(item) {
        const content = item.content;

        if(item.loading) {
            return (
                <div className="slds-chat-message__text slds-chat-message__text_inbound">
                    <span className="slds-icon-typing slds-is-animated" title="Waiting">
                        <span className="slds-icon-typing__dot"></span>
                        <span className="slds-icon-typing__dot"></span>
                        <span className="slds-icon-typing__dot"></span>
                    </span>
                </div>
            );
        }
        else {
            if(_.isString(content) || this.prop('wrapInMessage')) {
                return (
                    <div className="slds-chat-message__text slds-chat-message__text_inbound">
                        <span>{ content }</span>
                    </div>
                );
            }
            else {
                return content;
            }
        }
    }

    renderInbound(item) {
        const avatar = _.isFunction(item.buildAvatar) && item.buildAvatar();

        return (
            <li className="slds-chat-listitem slds-chat-listitem_inbound">
                <div className="slds-chat-message">
                    {
                        item.avatar && (
                        <span aria-hidden="true" className="slds-avatar slds-avatar_circle slds-chat-avatar">
                            <abbr className="slds-avatar__initials slds-avatar__initials_inverse" title={ item.avatar }>{ item.avatar }</abbr>
                        </span>
                        )
                    }
                    {
                        avatar && (
                        <span aria-hidden="true" className="slds-avatar slds-avatar_circle slds-chat-avatar">
                            { avatar }
                        </span>
                        )
                    }
                    <div className="slds-chat-message__body">
                        { this.renderInboundContent(item) }
                    </div>
                </div>
            </li>
        );
    }

    renderOutboundContent(item) {
        const content = item.content;

        return (
            <div className="slds-chat-message__text slds-chat-message__text_outbound">
                <span>{ content }</span>
            </div>
        );
    }

    renderOutbound(item) {
        const avatar = _.isFunction(item.buildAvatar) && item.buildAvatar();

        return (
            <li className="slds-chat-listitem slds-chat-listitem_outbound">
                <div className="slds-chat-message">
                    <div className="slds-chat-message__body">
                        { this.renderOutboundContent(item) }
                    </div>
                    {
                        avatar && (
                        <span aria-hidden="true" className="slds-avatar slds-avatar_circle slds-chat-avatar slds-avatar_right">
                            { avatar }
                        </span>
                        )
                    }
                </div>
            </li>
        );
    }

    renderError(item) {
        return (
            <li className="slds-chat-listitem slds-chat-listitem_event">
                <div className="slds-chat-event slds-has-error" role="alert">
                    <div className="slds-chat-event__rule"></div>
                    <div className="slds-chat-event__body">
                        <span className="slds-icon_container slds-icon-utility-error slds-chat-icon" title="warning">
                            <PrimitiveIcon
                                iconName="utility:error"
                                className="slds-icon slds-icon_x-small slds-icon-text-default slds-icon-text-default"
                                variant="bare"
                            >
                            </PrimitiveIcon>
                        </span>
                        <p>
                            { item.content }
                        </p>
                    </div>
                    <div className="slds-chat-event__rule"></div>
                </div>
            </li>
        );
    }

    renderItem(item) {
        switch(item.type) {
            case ItemType.Inbound:
                return this.renderInbound(item);
            case ItemType.Outbound:
                return this.renderOutbound(item);
            case ItemType.Error:
                return this.renderError(item);
            default:
                return null;
        }
    }

    render(props, state) {
        const [{
            className,
            heading,
            items,
        }, rest] = this.getPropValues();

        return (
            <section role="log" className={ `slds-chat ${className}` } data-type={ this.getTypeName() } { ...rest }>
                <div className="slds-chat-bookend">
                    <span className="slds-icon_container slds-icon-utility-chat slds-chat-icon">
                        <PrimitiveIcon
                            iconName="utility:chat"
                            className="slds-icon slds-icon_x-small slds-icon-text-default"
                            variant="bare"
                        >
                        </PrimitiveIcon>
                    </span>
                    <p>
                        { heading }
                    </p>
                </div>
                <ul className="slds-chat-list">
                    {
                        _.map(items, this.renderItem)
                    }
                </ul>
            </section>
        );
    }
}

Chat.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    heading: PropTypes.isString('heading').demoValue('Chat started'),
    wrapInMessage: PropTypes.isBoolean('wrapInMessage').defaultValue(false).demoValue(false),
    items: PropTypes.isArray('items').shape({
        type: PropTypes.isString('type').values(_.values(ItemType)),
        content: PropTypes.isObject('content'),
        loading: PropTypes.isBoolean('loading'),
    }),
};

Chat.propTypesRest = true;
Chat.displayName = "Chat";
