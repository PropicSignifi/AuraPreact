(function(w) {
    // getObjectKeys :: a -> [String]
    const getObjectKeys = obj => Object.keys(obj).sort();

    // getCurrentService :: State -> ServiceDescriptor
    const getCurrentService = state => state.serviceDescriptors[state.currentServiceName];

    // getServiceActionNames :: ServiceDescriptor -> [String]
    const getServiceActionNames = getObjectKeys;

    // getServiceAction :: (State, String, String) -> ServiceAction
    const getServiceAction = (state, serviceName, serviceActionName) => _.get(state, `serviceDescriptors.${serviceName}.${serviceActionName}`);

    class $RemoteApiStore extends $Store {
        constructor() {
            super();
        }

        getInitialState() {
            return {
                serviceNames: (window.SERVICE_NAMES || []).sort(),
                serviceDescriptors: {},
                currentServiceName: null,
                currentServiceActionName: null,
            };
        }

        getUpdateFunctions() {
            return {
                setServiceDescriptors: (descriptors, state) => {
                    return {
                        serviceDescriptors: descriptors,
                    };
                },

                setCurrentService: (serviceName, state) => {
                    return {
                        currentServiceName: serviceName,
                    };
                },

                setCurrentServiceAction: (serviceActionName, state) => {
                    return {
                        currentServiceActionName: serviceActionName,
                    };
                },
            };
        }

        getComputeFunctions() {
            return {
                currentServiceActionNames: state => {
                    const currentService = getCurrentService(state);
                    return currentService ? getServiceActionNames(currentService) : [];
                },

                currentServiceAction: state => {
                    return getServiceAction(state, state.currentServiceName, state.currentServiceActionName);
                },
            };
        }

        getServiceNames() {
            return this.getState().serviceNames;
        }

        hasServiceDescriptor(serviceName) {
            return this.getState().serviceDescriptors[serviceName];
        }
    }

    window.$Expose.add("RemoteApi", {
        getCurrentService,
        getServiceActionNames,
        getServiceAction,
    });

    w.RemoteApiStore = new $RemoteApiStore();
})(window);
