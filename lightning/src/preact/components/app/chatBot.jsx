import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import Chat from '../chat/chat';
import DockedComposer from '../dockedComposer/dockedComposer';
import Textarea from '../textarea/textarea';
import Select from '../select/select';
import Actions from '../utils/actions';
import Utils from '../utils/utils';
import Config from '../utils/config';
import CommandManager from '../cmd/cmd';
import styles from './chatBot.less';
import { Observable, Subject, } from 'rxjs';

Config.defineConfig([
    {
        name: 'Assistant Bot - chat history limit',
        path: '/System/UI/App/chatHistory/limit',
        type: Config.Types.Integer,
        description: 'The limit of the chat history for assistant bot',
    },
    {
        name: 'Assistant Bot - command',
        path: '/System/UI/App/cmd/extension',
        type: Config.Types.Extension,
        description: 'Customise assistant bot commands',
    },
]);

let _lastChatMessage = null;

export default class ChatBot extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            chatVisible: false,
            chatItems: [
                {
                    type: 'inbound',
                    content: 'Hi, what can I do for you?',
                },
            ],
            chatMessage: '',
            chatRequesting: false,
            userOptions: [],
        });

        this.chat = null;
        this.chatTextarea = null;
        this.chatLimit = Config.getValue('/System/UI/App/chatHistory/limit') || 100;

        this.bind([
            'onCloseChat',
            'onChatMessageChange',
            'onChatMessageKeyDown',
            'setChat',
            'setChatTextarea',
            'onUserChange',
        ]);
    }

    componentDidMount() {
        super.componentDidMount();

        if(_.includes(Config.getValue('/System/UserInfo[Readonly]/Features'), 'AccessConfigTree')) {
            Actions.registerAction('Bot', () => {
                this.setState({
                    chatVisible: true,
                }, () => {
                    this.scrollToChatBottom();
                });
            });
        }

        Config.loadExtension('/System/UI/App/cmd/extension', null, resources => {
            _.forEach(resources, resource => {
                Utils.retrieve(resource).then(cmds => {
                    if(cmds) {
                        CommandManager.registerCommands(cmds);
                    }
                });
            });
        });

        window.$Utils.registerEmpHandler('Bot Message', data => {
            const userName = Config.getValue('/System/UserInfo[Readonly]/Name');
            if(data.title === userName || data.title === 'All') {
                const newItem = {
                    type: 'inbound',
                    content: data.data,
                };

                if(this.subject) {
                    this.subject.next(newItem);
                }
            }
        });

        if(!this.subject) {
            this.subject = new Subject();
            this.subject
                .distinctUntilChanged((item1, item2) => _.isEqual(item1, item2))
                .subscribe(data => {
                    const lastItem = _.last(this.state.chatItems);
                    let newItems = lastItem.loading ?
                        Utils.update(this.state.chatItems, _.size(this.state.chatItems) - 1, data) :
                        [...(this.state.chatItems), data];

                    const newLastItem = _.last(newItems);
                    if(!newLastItem.content) {
                        newItems = _.dropRight(newItems);
                    }

                    this.setState({
                        chatRequesting: data.loading,
                        chatItems: newItems,
                    }, () => {
                        this.scrollToChatBottom();
                    });
                });
        }

        window.$ActionService.DataLightningExtension.invoke('runQuery', {
            query: `SELECT Users.Name FROM AuthSession WHERE LoginType = 'Application' AND SessionType = 'UI' ORDER By LastModifiedDate DESC`,
        }).then(data => {
            const userOptions = _.chain(data)
                .map(item => {
                    const name = _.get(item, 'Users.Name');
                    return {
                        label: name,
                        value: name,
                    };
                })
                .uniqBy('label')
                .sortBy('label')
                .value();

            this.setState({
                userOptions: [
                    {
                        label: '-- Append User --',
                        value: '--',
                    },
                    {
                        label: 'All',
                        value: 'All',
                    },
                    ...userOptions,
                ],
            });
        });
    }

    onUserChange(newVal) {
        this.setState({
            chatMessage: this.state.chatMessage + `[${newVal}]`,
        }, () => {
            this.chatTextarea.focus();
        });
    }

    onCloseChat() {
        this.setState({
            chatVisible: false,
        });
    }

    onChatMessageChange(newVal) {
        this.setState({
            chatMessage: newVal,
        });
    }

    setChat(node) {
        this.chat = node;
    }

    setChatTextarea(node) {
        this.chatTextarea = node;
    }

    scrollToChatBottom() {
        Utils.delay(() => {
            if(!this.chat) {
                return;
            }

            const node = this.chat.base;
            node.scrollTop = node.scrollHeight - node.clientHeight;

            this.chatTextarea.focus();
        }, 50);
    }

    onChatMessageKeyDown(e) {
        if(!e.shiftKey && e.keyCode === 13) {
            e.preventDefault && e.preventDefault();
            // Enter
            const request = {
                type: 'outbound',
                content: e.target.value,
            };
            const response = {
                type: 'inbound',
                loading: true,
                content: 'loading...',
            };
            if(this.subject) {
                this.subject.next(request);
                this.subject.next(response);
            }

            _lastChatMessage = request.content;
            this.setState({
                chatMessage: '',
            });

            this.requestChatResponse(request.content)
                .then(resp => {
                    const response = {
                        type: 'inbound',
                        content: resp.data,
                    };
                    if(!resp.success) {
                        response.type = 'error';
                    }

                    if(this.subject) {
                        this.subject.next(response);
                    }
                }, error => {
                    this.setState({
                        chatRequesting: false,
                        chatItems: _.dropRight(this.state.chatItems),
                    });
                });
        }
        else if(e.keyCode === 38) {
            this.setState({
                chatMessage: _lastChatMessage,
            });
        }
    }

    requestChatResponse(input) {
        return CommandManager.execCommand(input, this);
    }

    setInputText(text) {
        this.setState({
            chatMessage: text,
        }, () => {
            this.chatTextarea.focus();
        });
    }

    render(props, state) {
        if(this.state.chatVisible) {
            return (
                <DockedComposer
                    visible={ this.state.chatVisible }
                    buttons={ [
                        {
                            iconName: 'utility:close',
                            alternativeText: 'Close',
                            onClick: this.onCloseChat,
                        },
                    ] }
                    header="Assistant Bot"
                    data-type={ this.getTypeName() }
                >
                    <div className="slds-m-around_x-small">
                        <Chat
                            ref={ this.setChat }
                            className={ `slds-box slds-scrollable ${styles.chatPane}` }
                            heading="Assistance Started"
                            items={ this.state.chatItems }
                        >
                        </Chat>
                        <Textarea
                            ref={ this.setChatTextarea }
                            name="message"
                            label="Message"
                            disabled={ this.state.chatRequesting }
                            channel="Chat Bot"
                            value={ this.state.chatMessage }
                            onValueChange={ this.onChatMessageChange }
                            onKeyDown={ this.onChatMessageKeyDown }
                        >
                        </Textarea>
                        <div className="slds-grid">
                            <Select
                                name="appendUser"
                                label="Append User"
                                variant="label-removed"
                                options={ this.state.userOptions }
                                value="--"
                                onValueChange={ this.onUserChange }
                            >
                            </Select>
                        </div>
                    </div>
                </DockedComposer>
            );
        }
    }
}
