(function(w) {
    const FUNC_REGEX = /function (\w+)\((.*)\)/;

    const mocks = {};

    // isMocked :: (String, String) -> Boolean
    const isMocked = (serviceName, actionName) => mocks[serviceName] && mocks[serviceName].actions[actionName];

    /*
     * A wrapper object for the Service Component.
     * 
     * A service component is one that has no UI but specifies one controller, thus
     * it have access to the server side actions of this controller.
     * 
     * This invocable service wraps the service component, and provides a convenient
     * interface to invoke these actions.
     * 
     * For more, please refer to 'ServiceComponent'.
     */
    class $InvocableService {
        constructor(serviceName, component) {
            this.serviceName = serviceName;
            this.component = component;
        }

        /*
         * Invoke a server side action with the name and params.
         * 
         * This will return a promise.
         */
        invokePlain(actionName, actionParams, options) {
            if(actionName) {
                if(isMocked(this.serviceName, actionName)) {
                    return mocks[this.serviceName].invoke(actionName, actionParams);
                }
                else {
                    return window.$Utils.invokeAction(this.component, actionName, actionParams || {}, null, options);
                }
            }
            else {
                throw new Error("No action name to invoke the action.");
            }
        }

        invoke(actionName, actionParams, options) {
            return this.invokePlain('invoke', {
                name: actionName,
                args: actionParams,
            }, options);
        }
    }

    class $MockableAction {
        constructor(f) {
            const result = FUNC_REGEX.exec(f.toString());
            if(result === null) {
                throw new Error(`Invalid function to mock. Please add functions like:
                    mock(function funcName(param1, param2) { ... })
                    `);
            }
            else {
                const [, funcName, funcParams] = result;
                this.name = funcName;
                this.params = _.chain(funcParams).
                    split(",").
                    map(_.trim).
                    value();
                this.f = f;
            }
        }

        invoke(actionParams = {}) {
            console.log("Invoked");
            return this.f.apply(
                null,
                this.params.map(param => actionParams[param])
            );
        }
    }

    class $MockableService {
        constructor() {
            this.actions = {};
        }

        mock(actionFunc) {
            if(actionFunc) {
                const action = new $MockableAction(actionFunc);
                this.actions[action.name] = action;
            }
        }

        invokePlain(actionName, actionParams) {
            const action = this.actions[actionName];
            if(action) {
                return window.$Utils.newPromise((resolve, reject) => {
                    window.setTimeout(
                        $A.getCallback(() => {
                            resolve(action.invoke(actionParams));
                        }),
                        500
                    );
                });
            }
        }

        invoke(actionName, actionParams) {
            return this.invokePlain(actionName, actionParams);
        }
    }

    // install :: $ActionService -> String -> Component -> $ActionService
    const install = _.curry((actionService, name, component) => {
        if(name && component) {
            actionService[name] = new $InvocableService(name, component);
            return actionService;
        }
        else {
            throw new Error("Invalid installation of the action service.");
        }
    });

    // uninstall :: $ActionService -> String -> $ActionService
    const uninstall = _.curry((actionService, name) => {
        delete actionService[name];
        return actionService;
    });

    // mock :: $ActionService -> String -> $MockableService
    const mock = _.curry((actionService, serviceName) => {
        if(!mocks[serviceName]) {
            mocks[serviceName] = new $MockableService();
        }

        if(!actionService[serviceName]) {
            actionService[serviceName] = mocks[serviceName];
        }

        return mocks[serviceName];
    });

    const $ActionService = {
    };

    /*
     * Function to install a service component under the given name.
     */
    $ActionService.install = install($ActionService);

    /*
     * Function to uninstall the service component by the given name.
     */
    $ActionService.uninstall = uninstall($ActionService);

    $ActionService.mock = mock($ActionService);

    w.$ActionService = $ActionService;
})(window);
