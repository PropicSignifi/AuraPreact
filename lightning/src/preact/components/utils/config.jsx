import DateTimeConvert from './dateTime';
import { $require } from '../modules/modules';

const getConfigItems = () => window.$SystemConfig;

const reservedPaths = [
    '/System/UserInfo[Readonly]/Name',
    '/System/UserInfo[Readonly]/Id',
    '/System/UserInfo[Readonly]/ProfileName',
    '/System/UserInfo[Readonly]/Features',
];

const Types = {
    String: 'String',
    Boolean: 'Boolean',
    Integer: 'Integer',
    Long: 'Long',
    Double: 'Double',
    Decimal: 'Decimal',
    Date: 'Date',
    DateTime: 'DateTime',
    Time: 'Time',
    Picklist: 'Picklist',
    MultiPicklist: 'MultiPicklist',
    JSON: 'JSON',
    Extension: 'Extension',
};

const configDefinitions = [];

const defineConfig = configDef => {
    const configDefs = _.isArray(configDef) ? configDef : [configDef];
    _.forEach(configDefs, def => {
        const old = _.find(configDefinitions, ['path', def.path]);
        if(!old) {
            configDefinitions.push(def);
        }
    });
};

const getConfigDefinitions = () => configDefinitions;

const _generatePaths = (path, globalData) => {
    if(_.includes(reservedPaths, path)) {
        return [path];
    }

    const userName = getValue('/System/UserInfo[Readonly]/Name');
    const profileName = getValue('/System/UserInfo[Readonly]/ProfileName');

    const recordTypePrefix = _.get(globalData, 'recordTypeName') ? `/RecordTypes/${_.get(globalData, 'recordTypeName')}` : '';
    const userPrefix = `/Users/${userName}`;
    const profilePrefix = `/Profiles/${profileName}`;

    if(recordTypePrefix) {
        return [
            userPrefix + recordTypePrefix + path,
            profilePrefix + recordTypePrefix + path,
            recordTypePrefix + path,
            userPrefix + path,
            profilePrefix + path,
            path,
        ];
    }
    else {
        return [
            userPrefix + path,
            profilePrefix + path,
            path,
        ];
    }
};

const _findItem = (path, globalData, items) => {
    const paths = _generatePaths(path, globalData);
    for(let p of paths) {
        const item = _.find(items, ['Path__c', p]);
        if(item) {
            return [item, p];
        }
    }

    return [];
};

const getValue = (path, globalData) => {
    const items = getConfigItems();
    const [item] = _findItem(path, globalData, items);

    if(item) {
        switch(item.Type__c) {
            case 'Boolean':
                return item.Value__c === 'true';
            case 'Integer':
            case 'Long':
            case 'Double':
            case 'Decimal':
                return _.toNumber(item.Value__c);
            case 'DateTime':
                return DateTimeConvert.convertDateTime(item.Value__c).datetime;
            case 'Date':
                return DateTimeConvert.convertDateTime(item.Value__c).date;
            case 'MultiPicklist':
                return _.chain(item.Value__c).split(';').compact().value();
            case 'JSON':
                try {
                    return JSON.parse(item.Value__c);
                }
                catch(e) {
                    return null;
                }
                break;
            default:
                return item.Value__c;
        }
    }
};

const getValues = (path, globalData) => {
    const items = getConfigItems();
    const matchedPaths = _generatePaths(path, globalData, items);
    const realPath = _.find(matchedPaths, p => _.some(items, item => _.startsWith(item.Path__c, p)));

    return _.chain(getConfigItems())
        .filter(item => _.startsWith(item.Path__c, realPath))
        .map(item => {
            return [
                _.trimStart(item.Path__c.substring(_.size(realPath)), '/'),
                getValue(item.Path__c),
            ];
        })
        .fromPairs()
        .value();
};

const loadExtension = (path, globalData, callback) => {
    const value = Config.getValue(path, globalData);
    return loadExtensionRaw(value, callback);
};

const loadExtensionRaw = (value, callback) => {
    let p = null;
    if(value) {
        const filenames = _.chain(value).split(';').compact().value();
        p = $require(filenames);
    }
    else {
        p = Promise.resolve([]);
    }

    if(_.isFunction(callback)) {
        return p.then(resources => {
            callback(resources);
        });
    }
    else {
        return p;
    }
};

const getValuesHierarchy = (path, globalData) => {
    const data = {};

    const items = getConfigItems();
    const matchedPaths = _generatePaths(path, globalData, items);
    const realPath = _.find(matchedPaths, p => _.some(items, item => _.startsWith(item.Path__c, p)));

    _.chain(getConfigItems())
        .filter(item => _.startsWith(item.Path__c, realPath))
        .each(item => {
            const key = _.trimStart(item.Path__c.substring(_.size(realPath)), '/');
            _.set(data, _.replace(key, /\//g, '.'), item.Value__c);
        })
        .value();

    return data;
};

const Config = {
    getConfigItems,
    getValue,
    getValues,
    loadExtension,
    loadExtensionRaw,
    Types,
    defineConfig,
    getConfigDefinitions,
    getValuesHierarchy,
};

window.$Config = _.assign({}, window.$Config, Config);

export default Config;
