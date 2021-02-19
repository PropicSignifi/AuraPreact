import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import PropTypes from '../propTypes/propTypes';
import Chat from '../chat/chat';
import Input from '../input/input';
import ButtonIcon from '../buttonIcon/buttonIcon';
import Utils from '../utils/utils';
import Config from '../utils/config';
import styles from './chatBot.less';
import ChatBotProxyFactory from './chatBotProxyFactory';
import { Observable, Subject, } from 'rxjs';

export default class ChatBot extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            chatItems: [
            ],
            chatMessage: '',
            chatRequesting: false,
        });

        this.chat = null;
        this.chatInput = null;
        this.subscription = null;

        this.bind([
            "onChatMessageChange",
            "setChat",
            "setChatInput",
            "onChatMessageKeyDown",
            "onChatMessageButtonClick",
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        if(!this.subject) {
            this.subject = new Subject();
            this.subject.subscribe(data => {
                let newItems = [...(this.state.chatItems), data];

                this.setState({
                    chatItems: newItems,
                }, () => {
                    this.scrollToChatBottom();
                });
            });

            this.loadProxy(this.prop('proxy'), this.prop('proxyBaseUrl'), this.prop('proxyKey'));
        }
    }

    componentWillReceiveProps(nextProps, nextState) {
        super.componentWillReceiveProps(nextProps, nextState);

        if(nextProps.proxy !== this.props.proxy ||
            nextProps.proxyBaseUrl !== this.props.proxyBaseUrl ||
            nextProps.proxyKey !== this.props.proxyKey) {
            this.loadProxy(nextProps.proxy, nextProps.proxyBaseUrl, nextProps.proxyKey);
        }
    }

    buildLoadingMessage() {
        return {
            type: 'inbound',
            loading: true,
            content: 'Waiting for response ...',
            buildAvatar: this.buildInboundAvatar.bind(this),
        };
    }

    loadProxy(proxyName, baseUrl, key) {
        if(this.subscription) {
            this.subscription.unsubscribe();
        }

        const proxy = ChatBotProxyFactory.getProxy(proxyName);
        if(_.isFunction(proxy.init)) {
            proxy.init({
                baseUrl,
                key,
            });
        }

        this.subscription = proxy.subscribe(resp => {
            const response = {
                type: 'inbound',
                content: resp.data,
                buildAvatar: this.buildInboundAvatar.bind(this),
            };
            if(resp.success === false) {
                response.type = 'error';
            }

            if(this.subject) {
                this.subject.next(response);
            }
        }, error => {
            const response = {
                type: 'error',
                content: error.message,
            };

            if(this.subject) {
                this.subject.next(response);
            }
        });
    }

    getProxy() {
        return ChatBotProxyFactory.getProxy(this.prop('proxy'));
    }

    onChatMessageChange(newVal) {
        this.setState({
            chatMessage: newVal,
        });
    }

    setChat(node) {
        this.chat = node;
    }

    setChatInput(node) {
        this.chatInput = node;
    }

    scrollToChatBottom() {
        const autoFocus = this.prop('autoFocus');

        Utils.delay(() => {
            if(!this.chat) {
                return;
            }

            const node = this.chat.base;
            node.scrollTop = node.scrollHeight - node.clientHeight;

            if(autoFocus) {
                this.chatInput.focus();
            }
        }, 50);
    }

    buildInboundAvatar() {
        return this.getProxy().inboundAvatar;
    }

    buildOutboundAvatar() {
        return this.getProxy().outboundAvatar;
    }

    onChatMessageEnter(message) {
        if(!message) {
            return;
        }

        const request = {
            type: 'outbound',
            content: message,
            buildAvatar: this.buildOutboundAvatar.bind(this),
        };
        if(this.subject) {
            this.subject.next(request);
        }

        this.setState({
            chatMessage: '',
            chatRequesting: true,
        });

        this.requestChatResponse(request.content)
            .then(resp => {
                this.setState({
                    chatRequesting: false,
                });
            });
    }

    onChatMessageButtonClick(e) {
        this.onChatMessageEnter(this.state.chatMessage);
    }

    onChatMessageKeyDown(e) {
        if(!e.shiftKey && e.keyCode === 13) {
            e.preventDefault && e.preventDefault();
            this.onChatMessageEnter(e.target.value);
        }
    }

    requestChatResponse(input) {
        return this.getProxy().sendMessage(input);
    }

    render(props, state) {
        const [{
            className,
            heading,
        }, rest] = this.getPropValues();

        return (
            <div className={ `slds-m-around_x-small ${className}` }>
                <Chat
                    ref={ this.setChat }
                    className={ `slds-box slds-scrollable ${styles.chat}` }
                    heading={ heading }
                    wrapInMessage="true"
                    items={ this.state.chatRequesting ? [...(this.state.chatItems), this.buildLoadingMessage()] : this.state.chatItems }
                >
                </Chat>
                <div className="slds-grid">
                    <Input
                        ref={ this.setChatInput }
                        className={ `slds-col ${styles.chatInput}` }
                        name="message"
                        label="Message"
                        variant="label-removed"
                        disabled={ this.state.chatRequesting }
                        value={ this.state.chatMessage }
                        onValueChange={ this.onChatMessageChange }
                        onKeyDown={ this.onChatMessageKeyDown }
                    >
                    </Input>
                    <ButtonIcon
                        className={ styles.chatInputButton }
                        size="medium"
                        iconName="utility:forward"
                        alternativeText="Enter"
                        disabled={ this.state.chatRequesting }
                        onClick={ this.onChatMessageButtonClick }
                    >
                    </ButtonIcon>
                </div>
            </div>
        );
    }
}

ChatBot.propTypes = {
    className: PropTypes.isString('className').demoValue(''),
    heading: PropTypes.isString('heading').demoValue('Welcome'),
    autoFocus: PropTypes.isBoolean('autoFocus').demoValue(false).defaultValue(false),
    proxy: PropTypes.isString('proxy').demoValue('Default').defaultValue('Default'),
    proxyKey: PropTypes.isString('proxyKey').demoValue(''),
    proxyBaseUrl: PropTypes.isString('proxyBaseUrl').demoValue(''),
};

ChatBot.propTypesRest = true;
ChatBot.displayName = "ChatBot";
