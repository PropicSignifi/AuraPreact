import { h, render, Component } from 'preact';
import App from '../app/app';
import Config from './config';
import Analytics from './analytics';
import Celebration from '../celebration/celebration';
import Storage from '../storage/storage';

const apps = {};

const registerApp = (preactContainerName, app) => {
    if(preactContainerName && app) {
        apps[preactContainerName] = app;
    }

    return () => {
        delete apps[preactContainerName];
    };
};

const getApp = preactContainerName => {
    return apps[preactContainerName];
};

const showCustomModal = (preactContainerName, options) => {
    const app = getApp(preactContainerName);
    if(app) {
        app.showModal(options);
    }
    else {
        throw new Error('No valid app could be found');
    }
};

const hideCustomModal = preactContainerName => {
    const app = getApp(preactContainerName);
    if(app) {
        app.hideModal();
    }
};

const errorFormatters = [];

const registerErrorFormatter = formatter => {
    if(_.isFunction(formatter)) {
        errorFormatters.push(formatter);
    }

    return () => {
        _.pull(errorFormatters, formatter);
    };
};

const formatError = msg => {
    for(const formatter of errorFormatters) {
        const pretty = formatter(msg);
        if(pretty) {
            return pretty;
        }
    }

    return msg;
};

const CELEBRATION_DATA_LOCATOR = 'custom-celebration-zone';

class ModalContentWrapper extends Component {
    constructor() {
        super();

        this.state = {
            state: {},
        };

        this.getWrapperState = this.getWrapperState.bind(this);
        this.setWrapperState = this.setWrapperState.bind(this);
    }

    getChildContext() {
        return {
            registerForm: form => {
                if(_.isFunction(this.props.onSetForm)) {
                    this.props.onSetForm(form);
                }
            },
        };
    }

    componentDidMount() {
        if(this.props.componentDidMount) {
            this.props.componentDidMount.call(this);
        }
    }

    getData() {
        return this.props.state || this.state.state;
    }

    getWrapperState(path) {
        return _.get(this.getData(), path);
    }

    setWrapperState(path, value) {
        const newState = _.assign({}, _.set(this.getData(), path, value));
        this.setState({
            state: newState,
        }, () => {
            if(_.isFunction(this.props.onStateChange)) {
                this.props.onStateChange(newState);
            }
        });
    }

    render(props, state) {
        const {
            onRender,
        } = props;

        if(_.isFunction(onRender)) {
            return onRender(this.getWrapperState, this.setWrapperState, this.props.context);
        }
    }
}

Config.defineConfig([
    {
        name: 'Extension - disable caching',
        path: '/System/UI/Extension/disableCaching',
        type: Config.Types.Boolean,
        description: 'Disable extension caching',
    },
    {
        name: 'System UI - debug',
        path: '/System/UI/debug/${topic}',
        type: Config.Types.Boolean,
        description: 'Enable debugging',
    },
    {
        name: 'System UI - interceptors',
        path: '/System/UI/G.apex/interceptors',
        type: Config.Types.Extension,
        description: 'Customise interceptors',
    },
    {
        name: 'System UI - box carring',
        path: '/System/UI/boxCarring/enabled',
        type: Config.Types.Boolean,
        description: 'Whether to enable box carring',
    },
    {
        name: 'System UI - box carring',
        path: '/System/UI/boxCarring/limit',
        type: Config.Types.Integer,
        description: 'The limit of queue for box carring control',
    },
    {
        name: 'System UI - box carring',
        path: '/System/UI/boxCarring/longQueryThreshold',
        type: Config.Types.Integer,
        description: 'The threshold of long query in milliseconds',
    },
    {
        name: 'System UI - box carring',
        path: '/System/UI/boxCarring/delay',
        type: Config.Types.Integer,
        description: 'The delay of long query in milliseconds',
    },
    {
        name: 'System UI - prioritized preact containers',
        path: '/System/UI/preactContainers/priority/delayList',
        type: Config.Types.String,
        description: 'The delay list of preact containers separated by coma',
    },
    {
        name: 'System UI - prioritized preact containers',
        path: '/System/UI/preactContainers/priority/delay',
        type: Config.Types.Integer,
        description: 'The delay time for the priority preact containers in milliseconds',
    },
]);

const boxCarringQueue = [];
const boxCarringDefaultEnabled = false;
const boxCarringDefaultLimit = 5;
const boxCarringDefaultLongQueryThreshold = 1500;
const boxCarringDefaultDelay = 50;
let boxCarringHasLongQuery = false;
const AURA_CALLBACK_PREFIX = "Error in $A.getCallback() [";
const MERGE_FIELD_PATTERN = '\{![ ]*([^}]+?)[ ]*\}';
const INTERPOLATION_PATTERN = '\\\$\{[ ]*([^}]+?)[ ]*\}';
const CUSTOM_QUERY_PATTERN = '^([a-zA-Z0-9]+)?((\[[a-zA-Z0-9]+="[^"]+"\])*)( ([a-zA-Z0-9]+)?((\[[a-zA-Z0-9]+="[^"]+"\])*))*$';

const notifications = [];
const notificationHandlers = [];
let autoDismissTimer = null;
let requestCounter = 0;
const retrieveCache = {};
const globalZones = {};
const globalActions = [];

const retrieve = (value, args, keyFn) => {
    const fnArgs = args || [];
    if(_.isFunction(value)) {
        if(_.isFunction(keyFn)) {
            const key = keyFn(...fnArgs);
            if(retrieveCache[key] === undefined) {
                const data = value(...fnArgs);
                retrieveCache[key] = window.$Utils.isPromise(data) ? data : Promise.resolve(data);
            }
            return retrieveCache[key];
        }
        else {
            const data = value(...fnArgs);
            return window.$Utils.isPromise(data) ? data : Promise.resolve(data);
        }
    }
    else if(window.$Utils.isPromise(value)) {
        return value;
    }
    else {
        return Promise.resolve(value);
    }
};

const autoDismiss = () => {
    if(!autoDismissTimer) {
        autoDismissTimer = window.setTimeout(() => {
            const first = _.find(notifications, item => _.isUndefined(item.autoClose) || item.autoClose);
            if(first) {
                dismiss(first);
                window.clearTimeout(autoDismissTimer);
                autoDismissTimer = null;
                autoDismiss();
            }
            else {
                window.clearTimeout(autoDismissTimer);
                autoDismissTimer = null;
            }
        }, 8000);
    }
};

const notify = notification => {
    const last = _.last(notifications);
    if(last && _.isEqual(last, notification)) {
        return;
    }

    notifications.push(notification);

    autoDismiss();

    _.forEach(notificationHandlers, handler => {
        handler(notifications);
    });
};

const dismiss = notification => {
    _.pull(notifications, notification);

    _.forEach(notificationHandlers, handler => {
        handler(notifications);
    });
};

const registerNotificationHandler = handler => {
    if(_.isFunction(handler)) {
        notificationHandlers.push(handler);
    }

    return () => {
        _.pull(notificationHandlers, handler);
    };
};

const startLoading = (local, preactName) => {
    if(window.$Utils.getCurrentApp()) {
        window.$Utils.startLoading(window.$Utils.getCurrentApp(), local, preactName);
    }
};

const startLoadingLocal = () => startLoading(true);

const stopLoading = (local, preactName) => {
    if(window.$Utils.getCurrentApp()) {
        window.$Utils.stopLoading(window.$Utils.getCurrentApp(), local, preactName);
    }
};

const stopLoadingLocal = () => stopLoading(true);

const busyloading = (promise, local, preactName) => {
    if(window.$Utils.getCurrentApp()) {
        startLoading(local, preactName);

        const newPromise = promise.catch(catchError).then(data => {
            stopLoading(local, preactName)
            return data;
        }, () => stopLoading(local, preactName));
        newPromise.isInBusyloading = true;
        return newPromise;
    }
    else {
        return promise.catch(catchError);
    }
};

const busyloadingLocal = promise => busyloading(promise, true);

const busyloadingWithin = (preactName, promise) => busyloading(promise, true, preactName);

const update = (target, key, value) => {
    if(_.isArray(target)) {
        const copy = _.clone(target);
        if(_.isNumber(key)) {
            copy[key] = value;
        }
        else if(_.isString(key)){
            if(value === undefined || value[key] === undefined) {
                throw new Error(`Invalid value indexed by ${key}`);
            }

            const index = _.findIndex(copy, [key, value[key]]);
            copy[index] = value;
        }
        return copy;
    }
    else if(_.isObject(target)) {
        return _.assign({}, target, { [key]: value });
    }
    else {
        return target;
    }
};

const alert = options => {
    if(window.$Utils.getCurrentApp()) {
        let state = options.state || {};
        let form = null;

        const renderModalContent = _.isFunction(options.renderContent) ? (root, context) => {
            window.requestAnimationFrame(() => {
                root.innerHTML = '';

                render((
                    <App>
                        <ModalContentWrapper
                            state={ state }
                            context={ context }
                            onRender={ options.renderContent }
                            componentDidMount={ options.componentDidMount }
                            onSetForm={ node => form = node }
                            onStateChange={ newVal => state = newVal }
                        >
                        </ModalContentWrapper>
                    </App>
                ), root);
            });
        } : null;

        const overrideOptions = {
            renderContent: undefined,
            renderModalContent,
        };

        if(overrideOptions.renderModalContent) {
            if(_.isFunction(options.onSave)) {
                overrideOptions.onSave = () => {
                    if(form) {
                        const msg = form.validate();
                        if(!_.isEmpty(msg)) {
                            return false;
                        }
                    }
                    return options.onSave(state);
                };
            }

            if(_.isFunction(options.onOther)) {
                overrideOptions.onOther = () => {
                    return options.onOther(state);
                };
            }
        }

        const newOptions = _.assign({}, options, overrideOptions);

        window.$Utils.getCurrentApp().alert(newOptions);
    }
    else {
        throw new Error("Failed to get current app");
    }
};

const popover = options => {
    if(window.$Utils.isNonDesktopBrowser()) {
        return alert(_.assign({}, options, {
            forceModal: true,
            variant: options.variant === 'error' ? 'prompt' : options.variant,
        }));
    }

    if(window.$Utils.getCurrentApp()) {
        let state = options.state || {};
        let form = null;

        const renderPopoverContent = _.isFunction(options.renderContent) ? (root, context) => {
            window.requestAnimationFrame(() => {
                root.innerHTML = '';

                render((
                    <App>
                        <ModalContentWrapper
                            state={ state }
                            context={ context }
                            onRender={ options.renderContent }
                            componentDidMount={ options.componentDidMount }
                            onSetForm={ node => form = node }
                            onStateChange={ newVal => state = newVal }
                        >
                        </ModalContentWrapper>
                    </App>
                ), root);
            });
        } : null;

        const overrideOptions = {
            renderContent: undefined,
            renderPopoverContent,
        };

        const newOptions = _.assign({}, options, overrideOptions);

        window.$Utils.getCurrentApp().popover(newOptions);
    }
    else {
        throw new Error("Failed to get current app");
    }
};

const toast = options => {
    if(options.variant === 'error') {
        alert({
            header: 'Error',
            variant: 'prompt',
            message: options.content,
            onCancelText: 'OK',
        });
    }
    else {
        if(window.$Utils.getCurrentApp()) {
            window.$Utils.getCurrentApp().toast(options);
        }
        else {
            throw new Error("Failed to get current app");
        }
    }
};

const catchError = error => {
    console.error(error);

    let msg = error ? error.toString() : "Unknown error";
    if(msg.startsWith(AURA_CALLBACK_PREFIX)) {
        msg = msg.substring(AURA_CALLBACK_PREFIX.length, msg.length - 1);
    }

    if(error.name) {
        msg = `Script Error: ${error.name} - ${msg}`;
    }

    msg = formatError(msg);

    delay(() => {
        toast({
            variant: 'error',
            content: msg,
        });
    }, 50);
};

const openUrl = (url, typeOptions = "_blank", encode = true, traceAnalytics = true) => {
    const options = _.isPlainObject(typeOptions) ? typeOptions : {
        type: typeOptions,
        afterPromise: false,
        encode,
        traceAnalytics,
    };

    if(options.traceAnalytics) {
        Analytics.fireRedirectEvent(null, `URL: ${url}`, null, null);
    }

    if(_.startsWith(url, 'http://') || _.startsWith(url, 'https://')) {
        if($A.get('$Browser.isIOS') && options.afterPromise) {
            return Utils.alert({
                header: 'Open URL',
                message: 'Do you want to open this url?',
                onSave: () => {
                    return window.open(url, '_blank');
                },
            });
        } else {
            return window.open(url, '_blank');
        }
    }
    else {
        if(window.$Utils.isNonDesktopBrowser()) {
            window.$Utils.fireAppEvent('e.force:navigateToURL', {
                url,
            });
        }
        else {
            let targetUrl = url;
            if(!_.startsWith(targetUrl, '/lightning/')) {
                const params = {
                    componentDef: "one:alohaPage",
                    attributes: {
                        address: url,
                    },
                };
                const json = JSON.stringify(params);
                if(options.encode){
                    targetUrl = window.location.origin + "/one/one.app#" + encodeURI(window.btoa(json));
                } else {
                    targetUrl = window.location.origin + url;
                }
            }
            window.open(targetUrl, options.type);
        }
    }
};

const openVisualforcePage = (pageName, params, rest, encode) => {
    Analytics.fireRedirectEvent(null, `VisualforcePage: ${pageName}`, null, null);

    const query = _.chain(params)
        .toPairs()
        .map(pair => pair[0] + '=' + pair[1])
        .join('&')
        .value();

    let name = null;

    if(_.includes(pageName, '__')){
        name = pageName;
    } else {
        name = getNamespacePrefix() + pageName;
    }

    const url = '/apex/' + name + (query ? '?' + query : '') + (rest ? rest : '');
    openUrl(url, '', encode, false);
};

const runOnDesktop = fn => {
    if(window.$Utils.isNonDesktopBrowser()) {
        toast({
            variant: "warning",
            content: 'This feature is only valid on desktop environments',
        });
    }
    else {
        if(_.isFunction(fn)) {
            fn();
        }
    }
};

const openComponentPage = (componentName, params, type = '_blank') => {
    return openComponentPageFromContainer(null, componentName, params, type);
};

const openComponentPageFromContainer = (preactContainerName, componentName, params, type = '_blank') => {
    Analytics.fireRedirectEvent(null, `Component: ${componentName}`, null, _.get(params, 'recordId'));

    if(Config.getValue('/System/Site[Readonly]/BaseUrl')) {
        const [,name] = _.split(componentName, ':');
        const paramsStr = _.chain(params)
            .toPairs()
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&')
            .value();

        const url = `${Config.getValue('/System/Site[Readonly]/BaseUrl')}/s/${name}?${paramsStr}`;
        return window.open(url, type);
    }
    else if(window.$Utils.isNonDesktopBrowser() || type ==='_self') {
        window.$Utils.navigateToComponentFromContainer(preactContainerName, componentName, params);
    }
    else {
        window.$Utils.generateComponentUrlFromContainer(preactContainerName, componentName, params)
            .then(url => {
                window.open(url, type);
            });
    }
};

const openSObject = (recordId, type = '_blank') => {
    Analytics.fireRedirectEvent(null, 'Open SObject', null, recordId);

    if(Config.getValue('/System/Site[Readonly]/BaseUrl')) {
        return window.$ActionService.DataLightningExtension.invoke('getSObjectName', {
            id: recordId,
        }).then(name => {
            if(!name) {
                return;
            }

            const ns = Utils.getNamespacePrefix();
            if(name.startsWith(ns)) {
                name = name.substring(ns.length);
            }
            if(name.endsWith('__c')) {
                name = name.substring(0, name.length - 3);
            }

            const url = `${Config.getValue('/System/Site[Readonly]/BaseUrl')}/s/${_.kebabCase(name)}/${recordId}`;
            return window.open(url, type);
        });
    }
    else if(window.$Utils.isNonDesktopBrowser() || type ==='_self') {
        window.$Utils.fireAppEvent('e.force:navigateToSObject', {
            recordId,
        });
    }
    else {
        window.open('/' + recordId, type);
    }
};

const createSObject = (sObjectName, type = '_blank') => {
    Analytics.fireRedirectEvent(null, `Open New SObject: ${sObjectName}`, null, null);

    if(window.$Utils.isNonDesktopBrowser() || type ==='_self') {
        window.$Utils.fireAppEvent('e.force:createRecord', {
            entityApiName: sObjectName,
        });
    }
    else {
        window.open('/lightning/o/' + sObjectName + '/new', type);
    }
};

const editSObject = (recordId, type = '_blank') => {
    Analytics.fireRedirectEvent(null, 'Open Edit SObject', null, recordId);

    if(window.$Utils.isNonDesktopBrowser() || type ==='_self') {
        window.$Utils.fireAppEvent('e.force:editRecord', {
            recordId: recordId,
        });
    }
    else {
        window.open('/lightning/r/' + recordId + '/edit', type);
    }
};

const getNamespacePrefix = () => {
    return window.$NAME_SPACE_PREFIX;
};

const scrolltoTop = () => {
    return window.scrollTo(0,0);
};

const getResource = path => window.$Config.getBasePath() + path;

const delay = (func, time=0) => {
    return new Promise((resolve, reject) => {
        window.setTimeout(() => {
            if(_.isFunction(func)){
                resolve(func());
            } else{
                resolve(func);
            }

        }, time);
    });
};

const getGQueryItemValue = item => {
    if(_.includes(item, ':')) {
        const [,ret] = _.split(item, ':');
        return ret;
    }
    else {
        return item;
    }
};

const collectAnalyticalMarkers = query => {
    const result = [];

    _.forEach(Object.keys(query), key => {
        const part1 = getGQueryItemValue(key);
        if(_.startsWith(part1, '...')) {
            // skip G.apex spreading
            return;
        }
        _.forEach(Object.keys(query[key]), subKey => {
            const part2 = getGQueryItemValue(subKey);
            result.push(`${part1}.${part2}`);
        });
    });

    return result;
};

const executeQuery = (query, requestId, options) => {
    const markers = collectAnalyticalMarkers(query);
    _.forEach(markers, marker => {
        Analytics.fireApiEvent(null, marker);
    });

    return Config.loadExtension('/System/UI/G.apex/interceptors').then(resources => {
        return Promise.all(_.map(resources, retrieve)).then(interceptors => {
            let newQuery = query;
            _.forEach(interceptors, interceptor => {
                if(_.isFunction(interceptor.beforeExecute)) {
                    const result = interceptor.beforeExecute(query, requestId, options);
                    newQuery = result || newQuery;
                }
            });

            let p = null;
            _.forEach(interceptors, interceptor => {
                if(_.isFunction(interceptor.execute)) {
                    const result = interceptor.execute(newQuery, requestId, options);
                    p = result || p;
                }
            });

            if(!p) {
                p = window.$ActionService.GLightningExtension.invoke("execute", {
                    query: JSON.stringify(newQuery),
                }, options);
            }

            _.forEach(interceptors, interceptor => {
                if(_.isFunction(interceptor.afterExecute)) {
                    p = p.then(data => {
                        const result = interceptor.afterExecute(data, newQuery, requestId, options);
                        return result ? result : data;
                    });
                }
            });

            return p;
        });
    });
};

const _getGApexQueryPath = query => {
    const category = _.first(Object.keys(query));
    const action = _.first(Object.keys(query[category]));
    return `${category}.${action}`;
};

const execute = (query, options) => {
    const boxCarringEnabled = _.defaultTo(Config.getValue('/System/UI/boxCarring/enabled'), boxCarringDefaultEnabled);
    const boxCarringLimit = _.defaultTo(Config.getValue('/System/UI/boxCarring/limit'), boxCarringDefaultLimit);
    const boxCarringLongQueryThreshold = _.defaultTo(Config.getValue('/System/UI/boxCarring/longQueryThreshold'), boxCarringDefaultLongQueryThreshold);
    const boxCarringDelay = _.defaultTo(Config.getValue('/System/UI/boxCarring/delay'), boxCarringDefaultDelay);
    const path = _getGApexQueryPath(query);
    const pathData = Storage.load('G.apex', path, {});
    const avgTime = pathData.count ? (pathData.time / pathData.count) : 0;
    const isLongQuery = avgTime >= boxCarringLongQueryThreshold;

    if(!boxCarringEnabled) {
        return new Promise((resolve, reject) => {
            const executeInQueue = () => {
                if(boxCarringQueue.length < boxCarringLimit && ((boxCarringHasLongQuery && !isLongQuery) || !boxCarringHasLongQuery || _.get(options, 'background'))) {
                    const p = executeQuery(query, requestCounter, options);
                    boxCarringQueue.push(p);
                    requestCounter += 1;

                    boxCarringHasLongQuery = isLongQuery;

                    const startTime = Date.now();
                    p.then(
                        data => {
                            _.pull(boxCarringQueue, p);
                            boxCarringHasLongQuery = false;
                            const endTime = Date.now();
                            if(pathData.count > 1000) {
                                Storage.save('G.apex', path, {
                                    time: endTime - startTime,
                                    count: 1,
                                });
                            }
                            else {
                                Storage.save('G.apex', path, {
                                    time: pathData.time + (endTime - startTime),
                                    count: pathData.count + 1,
                                });
                            }

                            return data;
                        },
                        error => {
                            _.pull(boxCarringQueue, p);
                            boxCarringHasLongQuery = false;
                            throw error;
                        }
                    ).then(resolve, reject);
                }
                else {
                    window.setTimeout(executeInQueue, boxCarringDelay);
                }
            };

            executeInQueue();
        });
    }
    else {
        return executeQuery(query, requestCounter++, options);
    }
};

const evaluateInterpolation = (input, context = {}, interpolationPattern = INTERPOLATION_PATTERN) => {
    const pattern = new RegExp(interpolationPattern, 'g');

    const interpolations = [];
    while(true) {
        const result = pattern.exec(input);
        if(result) {
            interpolations.push(result[1]);
        }
        else {
            break;
        }
    }

    const interpolationValues = {};
    for(const interpolation of interpolations) {
        interpolationValues[interpolation] = evalInContext(interpolation, context);
    }

    const output = input.replace(pattern, (match, p1) => {
        return interpolationValues[p1];
    });

    return output;
};

// input is a text with merge fields inside
// context is a mapping from sObjectName to recordId
const evaluateMergeFields = (input, context = {}, mergeFieldPattern = MERGE_FIELD_PATTERN) => {
    if(window.$ActionService.DataLightningExtension && input) {
        const pattern = new RegExp(mergeFieldPattern, 'g');

        const mergeFields = [];
        while(true) {
            const result = pattern.exec(input);
            if(result) {
                mergeFields.push(result[1]);
            }
            else {
                break;
            }
        }

        const request = _.chain(mergeFields)
            .groupBy(field => {
                const index = _.indexOf(field, '.');
                return field.substring(0, index);
            })
            .mapValues(fields => {
                return _.chain(fields)
                    .map(field => {
                        const index = _.indexOf(field, '.');
                        return field.substring(index + 1);
                    })
                    .join(',')
                    .value();
            })
            .map((value, key) => {
                if(context[key]) {
                    return {
                        recordId: context[key],
                        sObjectName: key,
                        fields: value,
                    };
                }
                else {
                    return null;
                }
            })
            .compact()
            .value();

        if(!_.isEmpty(request)) {
            return window.$ActionService.DataLightningExtension.invoke('queryFields', {
                request: JSON.stringify(request),
            }).then(data => {
                const fieldValues = {};

                for(let i = 0; i < _.size(data); i++) {
                    const requestItem = request[i];
                    const dataItem = data[i];
                    requestItem.result = dataItem;
                }

                _.forEach(request, requestItem => {
                    _.forEach(requestItem.result, (value, key) => {
                        fieldValues[requestItem.sObjectName + '.' + key] = value;
                    });
                });

                const output = input.replace(pattern, (match, p1) => {
                    return fieldValues[p1];
                });

                return output;
            });
        }
        else {
            return Promise.resolve(input);
        }
    }
    else {
        return Promise.resolve(input);
    }
};

const executeApex = (apexCallable, action, args) => {
    return window.$ActionService.DataLightningExtension.invoke('invokeApex', {
        className: apexCallable,
        action,
        args: JSON.stringify(args),
    });
};

const loadStaticResource = name => {
    if(!name) {
        return Promise.resolve(null);
    }

    const disableCaching = Config.getValue('/System/UI/Extension/disableCaching');
    let content = null;

    if(!disableCaching) {
        content = Storage.load('StaticResource', name);
    }

    if(!content) {
        return window.$ActionService.DataLightningExtension.invoke('getFileContent', {
            name,
        }, true).then(data => {
            if(!disableCaching) {
                Storage.save('StaticResource', name, data);
            }

            return data;
        });
    }
    else {
        window.$ActionService.DataLightningExtension.invoke('getFileContent', {
            name,
        }, true).then(data => {
            Storage.save('StaticResource', name, data);

            return data;
        });

        return Promise.resolve(content);
    }
};

const debug = (topic, message) => {
    if(Config.getValue(`/System/UI/debug/${topic}`)) {
        console.log(`[${topic}]: `, message);
    }
};

const downloadFile = (data, filename, mime) => {
    const blob = new Blob([data], {
        type: mime || 'application/octet-stream',
    });

    if (typeof window.navigator.msSaveBlob !== 'undefined') {
        // IE workaround for "HTML7007: One or more blob URLs were
        // revoked by closing the blob for which they were created.
        // These URLs will no longer resolve as the data backing
        // the URL has been freed."
        window.navigator.msSaveBlob(blob, filename);
    }
    else {
        const blobURL = window.URL.createObjectURL(blob);
        const tempLink = document.createElement('a');
        tempLink.style.display = 'none';
        tempLink.href = blobURL;
        tempLink.setAttribute('download', filename);

        // Safari thinks _blank anchor are pop ups. We only want to set _blank
        // target if the browser does not support the HTML5 download attribute.
        // This allows you to download files in desktop safari if pop up blocking
        // is enabled.
        if (typeof tempLink.download === 'undefined') {
            tempLink.setAttribute('target', '_blank');
        }

        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobURL);
    }
};

const buildCustomQueryObject = query => {
    const result = {};

    let p1 = 0;
    let p2 = 0;

    p1 = _.indexOf(query, '[');
    if(p1 < 0) {
        result.tagName = query;
    }
    else {
        result.tagName = query.substring(0, p1);
        result.attrs = {};

        while(true) {
            p2 = _.indexOf(query, ']', p1 + 1);
            if(p1 < 0 || p2 < 0) {
                break;
            }

            const slice = query.substring(p1 + 1, p2);
            const [ name, ...rest ] = _.split(slice, '=');
            const value = _.trim(rest.join('='), '"');
            result.attrs[name] = value;

            p1 = _.indexOf(query, '[', p2);
        }
    }

    return result;
};

const buildCustomQueryObjects = query => {
    if(!query) {
        return;
    }

    const result = [];
    const ptn = new RegExp(CUSTOM_QUERY_PATTERN);
    const res = ptn.exec(query);
    if(res) {
        result.push(buildCustomQueryObject(res[1] + res[2]));

        _.forEach(_.drop(res, 1), item => {
            if(_.startsWith(item, ' ')) {
                result.push(buildCustomQueryObject(_.trim(item)));
            }
        });
    }

    return result;
};

const matchesCustomQueryObject = (cmp, queryObject) => {
    if(!cmp || !queryObject) {
        return false;
    }

    if(queryObject.tagName && queryObject.tagName !== cmp.constructor.displayName) {
        return false;
    }

    if(!_.isEmpty(queryObject.attrs) && !_.every(queryObject.attrs, (val, key) => {
        return _.toString(cmp.props[key]) === _.toString(val);
    })) {
        return false;
    }

    return true;
};

const matchesCustomQuery = (componentPath, query) => {
    const queryObjects = buildCustomQueryObjects(query);

    const path = _.clone(componentPath);
    const q = _.clone(queryObjects);

    if(!matchesCustomQueryObject(_.last(path), _.last(q))) {
        return false;
    }

    for(let i = _.size(q) - 1; i >= 0; i--) {
        const qItem = q[i];

        if(_.isEmpty(path)) {
            return false;
        }

        let matched = false;
        while(!_.isEmpty(path)) {
            const pathItem = path.pop();
            if(matchesCustomQueryObject(pathItem, qItem)) {
                matched = true;
                break;
            }
        }

        if(!matched) {
            return false;
        }
    }

    return true;
};

const evalInContext = (expression, context, cleanUp = true) => {
    return evalInContextAsScript(null, expression, context, cleanUp);
};

const evalInContextAsScript = (scriptName, expression, context, cleanUp = true) => {
    const oldContext = cleanUp ? _.chain(context)
        .keys()
        .map(key => [key, window[key]])
        .fromPairs()
        .value() : null;

    // Due to locker service limitations, eval can only use global values
    _.assign(window, context);

    let finalScriptName = scriptName;
    if(finalScriptName) {
        finalScriptName = _.replace(finalScriptName, /\s+/g, '_');

        if(!finalScriptName.endsWith('.js')) {
            finalScriptName += '.js';
        }
    }

    const finalExpression = !finalScriptName ? expression : expression + `
    //# sourceURL=${finalScriptName}
    `;

    try {
        return eval(finalExpression);
    }
    catch(e) {
        console.error(e);
    }
    finally {
        _.assign(window, oldContext);
    }
};

const registerGlobalZone = zone => {
    if(zone && zone.name && (_.isFunction(zone.render) || _.isFunction(zone.renderApp))) {
        globalZones[zone.name] = zone;
    }
};

const getGlobalZones = () => globalZones;

const registerGlobalAction = action => {
    if(action && action.name && action.label && action.iconName && action.execute) {
        globalActions.push(action);
    }

    return () => {
        _.pull(globalActions, action);
    };
};

const _filterAction = (action, platform = (window.$Utils.isNonDesktopBrowser() ? 'mobile' : 'desktop')) => {
    if(_.isArray(action.support)) {
        if(!_.includes(action.support, platform)) {
            return false;
        }
    }

    if(_.isFunction(action.isAvailable)) {
        if(!action.isAvailable()) {
            return false;
        }
    }

    return true;
};

const getGlobalActions = options => {
    if(!options) {
        return globalActions;
    }
    else if(options.mobile) {
        return _.filter(globalActions, action => {
            return _filterAction(action, 'mobile');
        });
    }
    else {
        return _.filter(globalActions, action => {
            return _filterAction(action, 'desktop');
        });
    }
};

const showCelebration = () => {
    return new Promise((resolve, reject) => {
        window.requestAnimationFrame(() => {
            if($(`[data-locator="${CELEBRATION_DATA_LOCATOR}"]`).length === 0) {
                const container = document.createElement('div');
                container.setAttribute('data-locator', CELEBRATION_DATA_LOCATOR);
                document.body.appendChild(container);

                const onFinish = () => {
                    container.remove();
                    resolve();
                };

                render((
                    <Celebration onFinish={ onFinish }></Celebration>
                ), container);
            }
            else {
                resolve();
            }
        });
    });
};

const convertApexTypeToColumnConfig = apexType => {
    switch(apexType) {
        case 'CURRENCY':
            return {
                type: 'Currency',
            };
        case 'DATE':
            return {
                type: 'Date',
            };
        case 'DATETIME':
            return {
                type: 'DateTime',
            };
        case 'DOUBLE':
            return {
                filterBy: 'Number',
            };
        default:
            return {};
    }
};

const loadCustomColumns = ({
    sObjectName = '',
    fieldSetName = '',
    resourceName = '',
}) => {
    if(sObjectName && fieldSetName) {
        return window.$ActionService.DataLightningExtension.invoke('getFieldSet', {
            sObjectName,
            fieldSetName,
        }).then(data => {
            return _.map(data, item => {
                const column = {
                    name: item.fieldPath,
                    header: item.label,
                };

                _.assign(column, convertApexTypeToColumnConfig(item.typeApex));

                return column;
            });
        });
    }
    else if(resourceName) {
        return Config.loadExtensionRaw(resourceName).then(resource => Utils.retrieve(resource));
    }
};

const requireLibrary = (preactContainerName, libraries) => {
    return window.$Utils.requireLibrary(preactContainerName, libraries);
};

const runUntil = (executor, condition) => {
    if(!_.isFunction(executor) || !_.isFunction(condition)) {
        return;
    }

    return new Promise((resolve, reject) => {
        const p = window.setInterval(() => {
            if(condition()) {
                window.clearInterval(p);

                resolve(executor());
            }
        }, 50);
    });
};

const restRequest = (preactContainerName, request) => {
    const via = Config.getValue('/System/RestApi/via');
    if(via === 'Apex') {
        return window.$ActionService.DataLightningExtension.invoke('doRestApi', {
            request: JSON.stringify(request),
        });
    }
    else {
        return window.$Utils.restRequest(preactContainerName, request);
    }
};

const Utils = {
    classnames: window.$Utils.classnames,
    startLoading,
    stopLoading,
    busyloading,
    startLoadingLocal,
    stopLoadingLocal,
    busyloadingLocal,
    busyloadingWithin,
    update,
    alert,
    popover,
    toast,
    catchError,
    openUrl,
    openVisualforcePage,
    openComponentPage,
    openComponentPageFromContainer,
    openSObject,
    createSObject,
    editSObject,
    getNamespacePrefix,
    scrolltoTop,
    getResource,
    execute,
    delay,
    runOnDesktop,
    evaluateMergeFields,
    notify,
    dismiss,
    registerNotificationHandler,
    executeApex,
    loadStaticResource,
    debug,
    retrieve,
    downloadFile,
    matchesCustomQuery,
    evalInContext,
    evalInContextAsScript,
    registerGlobalZone,
    getGlobalZones,
    registerGlobalAction,
    getGlobalActions,
    showCelebration,
    registerErrorFormatter,
    loadCustomColumns,
    requireLibrary,
    evaluateInterpolation,
    runUntil,
    restRequest,
    registerApp,
    getApp,
    showCustomModal,
    hideCustomModal,
};

export default Utils;
