import { h, render, Component } from 'preact';
import BaseComponent from '../base/baseComponent';
import Notification from '../notification/notification';
import Utils from '../utils/utils';
import Config from '../utils/config';

Config.defineConfig([
    {
        name: 'System UI - emp processing',
        path: '/System/UI/App/emp/extension',
        type: Config.Types.Extension,
        description: 'Add extensions to handle event streaming',
    },
]);

let lastEmpEvent = null;

const empHandlers = {};

const isSameEmpEvent = (evt1, evt2) => {
    return evt1 && evt2 &&
        evt1.type === evt2.type &&
        evt1.title === evt2.title &&
        evt1.data === evt2.data;
};

const registerEmpHandler = (type, callback) => {
    if(_.isString(type) && _.isFunction(callback)) {
        empHandlers[type] = callback;
    }

    return () => {
        delete empHandlers[type];
    };
};

const notifyEmpEvent = (type, event) => {
    if(lastEmpEvent && isSameEmpEvent(lastEmpEvent, event)) {
        return;
    }

    const handler = empHandlers[type];
    if(_.isFunction(handler)) {
        handler(event);
    }

    lastEmpEvent = event;
};

export default class Notifications extends BaseComponent {
    constructor() {
        super();

        this.state = _.assign({}, super.state, {
            notifications: [],
        });
    }

    componentDidMount() {
        super.componentDidMount();

        window.$Utils.registerEmpHandler('UI Notification', data => {
            Utils.notify({
                title: data.title,
                message: data.data,
            });
        });

        Config.loadExtension('/System/UI/App/emp/extension', null, resources => {
            _.forEach(resources, resource => {
                Utils.retrieve(resource).then(handler => {
                    if(handler && handler.type) {
                        registerEmpHandler(handler.type, handler.exec);

                        window.$Utils.registerEmpHandler(handler.type, data => {
                            notifyEmpEvent(handler.type, data);
                        });
                    }
                });
            });
        });

        this.unregisterNotificationHandler = Utils.registerNotificationHandler(notifications => {
            this.setState({
                notifications: [...notifications],
            });
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        window.$Utils.unregisterEmpHandler('UI Notification');

        _.forEach(empHandlers, (handler, type) => {
            window.$Utils.unregisterEmpHandler(type);
        });

        this.unregisterNotificationHandler();
    }

    onCloseNotification(notification) {
        Utils.dismiss(notification);
    }

    render(props, state) {
        return (
            <div data-type={ this.getTypeName() }>
                {
                    _.map(this.state.notifications, (notification, index) => {
                        return (
                            <Notification
                                title={ notification.title }
                                message={ notification.message }
                                content={ notification.content }
                                style={ { top: `${index * 80}px` } }
                                onClose={ () => this.onCloseNotification(notification) }
                            >
                            </Notification>
                        );
                    })
                }
            </div>
        );
    }
}
