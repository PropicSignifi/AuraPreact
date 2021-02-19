import { h, render, setOption, } from 'preact';
import App from './components/app/app';
import Utils from './components/utils/utils';
import SideBar from './components/app/sideBar';
import Analytics from './components/utils/analytics';
import Config from './components/utils/config';
import Preactlet from './components/preactlet/preactlet';
import ConfigTree from './apps/ConfigTree/configTree';
import RestApiExplorer from './apps/RestApiExplorer/restApiExplorer';

setOption('renderObject', target => {
    if(target && target.markup) {
        return Preactlet.render(target.markup);
    }
});

Config.defineConfig([
    {
        name: 'Preact Container - hook',
        path: '/System/PreactContainers/${name}/hooks',
        type: Config.Types.Extension,
        description: 'Customise hooks for preact containers',
    },
]);

Config.defineConfig([
    {
        name: 'System UI Bootstrap',
        path: '/System/UI/bootstrap',
        type: Config.Types.Extension,
        description: 'The bootstrap scripts to load',
    },
]);

Config.defineConfig([
    {
        name: 'System Site UI Bootstrap',
        path: '/System/UI/Site/${siteName}/bootstrap',
        type: Config.Types.Extension,
        description: 'The bootstrap scripts to load for a site',
    },
]);

Utils.registerGlobalZone({
    name: 'sideBarActions',

    className: 'slds-custom-sidebar',

    isAvailable: () => {
        const actions = Utils.getGlobalActions({
            mobile: false,
        });

        return !window.$Utils.isNonDesktopBrowser() && _.size(actions) > 0;
    },

    renderApp: () => {
        return (
            <SideBar standalone="false"></SideBar>
        );
    },
});

/**
Utils.registerGlobalAction({
    name: 'hello',
    label: 'Hello',
    iconName: 'utility:task',
    support: ['mobile', 'desktop'],
    execute: () => {
        Utils.alert({
            header: 'Test',
            message: 'hello',
        });
    },
});
*/

class $PreactStore {
    constructor() {
        this.$components = {};
    }

    getComponents() {
        return this.$components;
    }

    getComponentNames() {
        return Object.keys(this.$components);
    }

    getComponent(name) {
        return this.$components[name];
    }

    addComponent(name, cmpRenderer) {
        if(_.isString(name) && _.isFunction(cmpRenderer)) {
            this.$components[name] = (...args) => {
                const [container] = args;
                const siteName = Config.getValue('/System/Site[Readonly]/Name');
                const bootstrapPath = siteName ? `/System/UI/Site/${siteName}/bootstrap` : `/System/UI/bootstrap`;

                Promise.all([
                    Config.loadExtension(`/System/PreactContainers/${name}/hooks`).then(resources => Promise.all(_.map(resources, Utils.retrieve))),
                    Config.loadExtension(bootstrapPath).then(resources => Promise.all(_.map(resources, Utils.retrieve))),
                ]).then(([hooks, bootstraps]) => {
                    _.forEach(bootstraps, bootstrap => {
                        if(bootstrap && _.isFunction(bootstrap.init)) {
                            bootstrap.init();
                        }
                    });

                    const preactContainerHook = _.assign({}, ...hooks);
                    window.$PreactContainerHooks = window.$PreactContainerHooks || {};
                    window.$PreactContainerHooks[name] = preactContainerHook;
                    const init = preactContainerHook.init || ((cmpRenderer, args) => {
                        cmpRenderer(...args);
                    });

                    container.innerHTML = '';
                    init(cmpRenderer, args);
                });
            };
        }
    }

    removeComponent(name) {
        delete this.$components[name];
    }

    registerPreactlet(name, component) {
        Preactlet.registerPreactlet(name, component);
    }

    wrap(component) {
        return {
            markup: component,
        };
    }

    renderPreactlet(component, container) {
        const comp = Preactlet.render(component);
        render(comp, container);
    }

    getPreactletManager() {
        return Preactlet;
    }
}

const PreactStore = new $PreactStore();

const registerComponent = (name, Comp) => {
    PreactStore.addComponent(name, function(container, props, fireEvent, globalData) {
        Analytics.fireComponentEvent(name, 'loaded', _.get(globalData, 'recordId'));

        render((
            <App globalData={ globalData }>
                <Comp {...props}></Comp>
            </App>
        ), container);
    });
};

registerComponent('configTree', ConfigTree);
registerComponent('restApiExplorer', RestApiExplorer);

window.PreactStore = PreactStore;

const BootStrapManager = {
    registerComponent,
    PreactStore,
};

export default BootStrapManager;
