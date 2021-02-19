import { h, render, Component } from 'preact';
import Utils from '../utils/utils';
import Config from '../utils/config';
import { Observable, Subject, } from 'rxjs';

const proxies = {};

const defaultSubject = new Subject();
const DefaultProxy = {
    name: 'Default',
    inboundAvatar: null,
    outboundAvatar: null,

    init: options => {
    },

    sendMessage: message => {
        return Utils.delay(() => {
            defaultSubject.next({
                data: message,
            });
        }, 500);
    },

    subscribe: subscriber => {
        return defaultSubject.subscribe(subscriber);
    },
};

const registerChatBotProxy = proxy => {
    if(proxy && proxy.name) {
        proxies[proxy.name] = proxy;
    }

    return () => {
        _.pull(proxies, proxy);
    };
};

const getProxy = name => {
    return proxies[name] || DefaultProxy;
};

const ProxyFactory = {
    registerChatBotProxy,
    getProxy,
};

export default ProxyFactory;
