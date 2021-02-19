import Config from './config';
import Utils from './utils';

Config.defineConfig([
    {
        name: 'Analytics Data Appenders',
        path: '/System/UI/Analytics/appenders',
        type: Config.Types.String,
        description: 'The names of the analytics data appenders, separated by semicolon',
    },
]);

const BUFFER_TIME = 5000;

const Type = {
    Component: 'Component',
    Action: 'Action',
    API: 'API',
    Marker: 'Marker',
    Redirect: 'Redirect',
};

const dataAppenders = {
    Console: dataList => {
        return Utils.delay(() => {
            console.log(JSON.stringify(dataList));
        }, 0);
    },
};

const defaultListener = data => {
    const appenderNames = Config.getValue('/System/UI/Analytics/appenders');
    const appenders = _.chain(appenderNames)
        .split(';')
        .map(appenderName => dataAppenders[appenderName])
        .compact()
        .value();

    _.forEach(appenders, appender => {
        appender(data);
    });
};
const listeners = [defaultListener];

const buffer = [];

window.setInterval(() => {
    if(!_.isEmpty(buffer)) {
        const bufferData = _.clone(buffer);
        _.forEach(listeners, listener => {
            if(_.isFunction(listener)) {
                listener(bufferData);
            }
        });

        buffer.length = 0;
    }
}, BUFFER_TIME);

const next = data => {
    buffer.push(data);
};

const fireEvent = data => {
    const timestamp = Date.now();
    // get the real container from the unique name
    const [container] = _.split(data.container, ':');
    const device = _.chain(
        {
            formFactor: $A.get('$Browser.formFactor'),
            android: $A.get('$Browser.isAndroid'),
            iOS: $A.get('$Browser.isIOS'),
            iPad: $A.get('$Browser.isIPad'),
            iPhone: $A.get('$Browser.isIPhone'),
            tablet: $A.get('$Browser.isTablet'),
            windowsPhone: $A.get('$Browser.isWindowsPhone'),
        })
        .toPairs()
        .filter(([,value]) => !!value)
        .fromPairs()
        .value();

    next(_.assign({}, data, {
        userId: Config.getValue('/System/UserInfo[Readonly]/Id'),
        timestamp,
        container,
        device,
    }));
};

const fireComponentEvent = (preactContainer, message, recordId) => {
    fireEvent({
        type: Type.Component,
        container: preactContainer,
        message,
        recordId,
    });
};

const fireActionEvent = (preactContainer, message, recordId) => {
    fireEvent({
        type: Type.Action,
        container: preactContainer,
        message,
        recordId,
    });
};

const fireApiEvent = (preactContainer, message, recordId) => {
    fireEvent({
        type: Type.API,
        container: preactContainer,
        message,
        recordId,
    });
};

const fireMarkerEvent = (preactContainer, message, recordId) => {
    fireEvent({
        type: Type.Marker,
        container: preactContainer,
        message,
        recordId,
    });
};

const fireRedirectEvent = (preactContainer, message, recordId, spawnedRecordId) => {
    fireEvent({
        type: Type.Redirect,
        container: preactContainer,
        message,
        recordId,
        spawnedRecordId,
    });
};

const addAnalyticsEventListener = listener => {
    if(listener) {
        listeners.push(listener);
    }

    return () => {
        _.pull(listeners, listener);
    };
};

const Analytics = {
    addAnalyticsEventListener,
    fireEvent,
    fireComponentEvent,
    fireActionEvent,
    fireApiEvent,
    fireMarkerEvent,
    fireRedirectEvent,
};

window.$Analytics = Analytics;
export default Analytics;
