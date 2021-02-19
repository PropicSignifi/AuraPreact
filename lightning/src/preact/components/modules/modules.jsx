import Preactlet from '../preactlet/preactlet';
import Utils from '../utils/utils';

window.$CTC_Modules = window.$CTC_Modules || {};
window.$CTC_Module_Definitions = window.$CTC_Module_Definitions || {};
window.$CTC_Loading_Modules = window.$CTC_Loading_Modules || {};

export const $define = (name, deps, factory) => {
    let module = Preactlet.getRenderingComponent(name);
    if(module) {
        throw new Error(`Packaged module ${name} cannot be overridden`);
    }

    if(_.isString(name) && _.isFunction(factory)) {
        window.$CTC_Module_Definitions[name] = {
            name,
            deps: deps || [],
            factory,
        };
    }
};

window.$define = $define;

export const $require = name => {
    if(_.isArray(name)) {
        return Promise.all(_.map(name, $require));
    }

    let module = Preactlet.getRenderingComponent(name);
    let p = null;
    if(window.$CTC_Loading_Modules[name]) {
        throw new Error(`Circular module loading detected with ${name}`);
    }
    window.$CTC_Loading_Modules[name] = true;

    if(!module) {
        module = window.$CTC_Modules[name];
    }

    if(!module) {
        const definition = window.$CTC_Module_Definitions[name];
        if(!definition) {
            p = Utils.loadStaticResource(name).then(data => {
                const content = data.body;
                if(!content) {
                    return Promise.resolve(content);
                }

                let result = null;
                let jsonError = null;

                try {
                    result = JSON.parse(content);
                }
                catch(e) {
                    jsonError = e;
                }

                if(!result) {
                    try {
                        result = window.eval(content + `
                            //# sourceURL=${name}.js
                            `);
                    }
                    catch(e) {
                        Utils.catchError(e);
                    }
                }

                if(result && _.isFunction(result.then)) {
                    return result.then(res => {
                        if(!window.$CTC_Module_Definitions[name] && res) {
                            $define(name, null, () => res);
                        }

                        if(!window.$CTC_Module_Definitions[name]) {
                            if(jsonError) {
                                throw new Error(`Failed to load module ${name}: either ${jsonError} or mismatching module name with the static resource name`);
                            }
                            else {
                                throw new Error(`Failed to load module ${name}`);
                            }
                        }

                        return $require(name);
                    });
                }
                else {
                    if(!window.$CTC_Module_Definitions[name] && result) {
                        $define(name, null, () => result);
                    }

                    if(!window.$CTC_Module_Definitions[name]) {
                        if(jsonError) {
                            throw new Error(`Failed to load module ${name}: either ${jsonError} or mismatching module name with the static resource name`);
                        }
                        else {
                            throw new Error(`Failed to load module ${name}`);
                        }
                    }

                    return $require(name);
                }
            }, Utils.catchError);
        }
        else {
            p = Promise.all(_.map(definition.deps, $require))
                .then(deps => {
                    const result = definition.factory(...deps);
                    window.$CTC_Modules[name] = result;
                    return result;
                }, Utils.catchError);
        }
    }
    else {
        p = Promise.resolve(module);
    }

    window.$CTC_Loading_Modules[name] = false;

    return p;
};

window.$require = $require;
