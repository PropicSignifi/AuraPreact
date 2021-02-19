import Utils from './utils';

const actionProviders = [];

const registerActionProvider = provider => {
    if(_.isFunction(provider)) {
        actionProviders.push(provider);
    }
};

// name, isActive, description, execute
const registerAction = (name, action) => {
    if(_.isString(name)) {
        window.$SystemActions = window.$SystemActions || {};

        let actionObj = null;
        if(_.isString(action)) {
            actionObj = {
                execute: () => Utils.openUrl(action),
            };
        }
        else if(_.isFunction(action)) {
            actionObj = {
                execute: action,
            };
        }
        else {
            actionObj = action;
        }

        actionObj.name = name;
        window.$SystemActions[name] = actionObj;
    }
};

const unregisterAction = name => {
    if(name) {
        delete window.$SystemActions[name];
    }
};

const getActions = () => {
    return _.chain(window.$SystemActions)
        .toPairs()
        .filter(pair => {
            const action = pair[1];
            if(_.isFunction(action.isActive)) {
                return action.isActive();
            }
            else {
                return true;
            }
        })
        .fromPairs()
        .value();
};

const invokeAction = (name, input) => {
    if(name) {
        const action = window.$SystemActions[name];
        if(_.isFunction(action.isActive) && !action.isActive()) {
            return;
        }

        return action.execute(input);
    }
};

const init = () => {
    Promise.all(_.map(actionProviders, provider => {
        const provided = provider();
        return window.$Utils.isPromise(provided) ? provided : Promise.resolve(provided);
    })).then(data => {
        const actions = _.flattenDeep(data);
        _.forEach(actions, action => {
            registerAction(action.name, action);
        });
    });
};

const Actions = {
    registerAction,
    unregisterAction,
    getActions,
    invokeAction,
    registerActionProvider,
    init,
};

export default Actions;
