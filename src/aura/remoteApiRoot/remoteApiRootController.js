({
    onInit : function(component, event, helper) {
        window.RemoteApiStore.addListener("RemoteApiApp", function(changes, computedChanges) {
            var state = window.RemoteApiStore.getState();
            var computedState = window.RemoteApiStore.getComputedState();
            if(changes.contains("currentServiceName")) {
                component.set("v.currentServiceName", state.currentServiceName);
            }
            if(changes.contains("currentServiceActionName")) {
                component.set("v.currentServiceActionName", state.currentServiceActionName);
            }
            if(computedChanges.contains("currentServiceActionNames")) {
                component.set("v.serviceActionNames", computedState.currentServiceActionNames);
            }
            if(computedChanges.contains("currentServiceAction")) {
                var serviceAction = computedState.currentServiceAction;
                component.set("v.serviceAction", serviceAction);
                component.set("v.serviceActionParams", {});
                component.set("v.serviceActionResult", "");

                if(serviceAction && !_.isEmpty(serviceAction.params)) {
                    window.$Utils.busyloading(component,
                        window.$Utils.createComponents(
                            window.$Utils.fromXml(_.chain(serviceAction.params).
                                map(function(param) {
                                    return '<c:textarea name="' + param.paramName + '" ' +
                                        'value="{! v.serviceActionParams.' + param.paramName + ' }" ' +
                                        'label="' + param.paramName + "(" + _.escape(param.paramType) + ')" ' +
                                        'placeholder="' + param.paramDescription + '">' +
                                        '</c:textarea>';
                                }).
                                join("\n").
                                value(), component)
                        ).then(function(newComps) {
                            var container = component.find("paramsContainer");
                            container.set("v.body", []);

                            var body = container.get("v.body");
                            body = body.concat(newComps);
                            container.set("v.body", body);
                        })
                    );
                }
                else {
                    var container = component.find("paramsContainer");
                    container.set("v.body", []);
                }
            }
        });

        var serviceNames = window.RemoteApiStore.getServiceNames();
        var passedInServiceName = component.get('v.serviceName');
        if(passedInServiceName) {
            serviceNames = _.concat(serviceNames, _.split(passedInServiceName, ','));
        }

        component.set("v.serviceNames", serviceNames);
    },

    onDestroy : function(component, event, helper) {
        window.RemoteApiStore.removeListener("RemoteApiApp");
    },

    selectService : function(component, event, helper) {
        var currentServiceName = component.get("v.currentServiceName");
        if(!window.RemoteApiStore.hasServiceDescriptor(currentServiceName)) {
            window.$Utils.startLoading(component);
            window.$Utils.createComponent(
                window.$Utils.fromXml("<c:" + window.$Utils.toLowerCaseFirst(currentServiceName) + "/>")
            ).then(function(newComp) {
                var container = component.find("container");
                var body = container.get("v.body");
                body.push(newComp);
                container.set("v.body", body);

                return window.$Utils.newPromise(function(resolve, reject) {
                    window.setTimeout($A.getCallback(function() {
                        resolve(window.$ActionService[currentServiceName].invokePlain("apiDescriptorForLightning"));
                    }), 500);
                }).then(function(data) {
                    window.$Utils.stopLoading(component);
                    var serviceDescriptor = {};
                    serviceDescriptor[currentServiceName] = data;
                    window.RemoteApiStore.dispatch(window.RemoteApiStore.Updates.setServiceDescriptors(serviceDescriptor));
                    window.RemoteApiStore.dispatch(window.RemoteApiStore.Updates.setCurrentService(currentServiceName));
                });
            });
        }
        else {
            window.RemoteApiStore.dispatch(window.RemoteApiStore.Updates.setCurrentService(currentServiceName));
        }
    },

    selectServiceAction : function(component, event, helper) {
        var currentServiceActionName = component.get("v.currentServiceActionName");
        window.RemoteApiStore.dispatch(window.RemoteApiStore.Updates.setCurrentServiceAction(currentServiceActionName));
    },

    onSend : function(component, event, helper) {
        var currentServiceName = component.get("v.currentServiceName");
        var currentServiceActionName = component.get("v.currentServiceActionName");
        var serviceActionParams = component.get("v.serviceActionParams");
        var serviceAction = component.get("v.serviceAction");

        var serviceActionParamTypes = _.chain(serviceAction.params).
            map(function(param) {
                return [param.paramName, param.paramType];
            }).
            fromPairs().
            value();

        var params = _.mapValues(serviceActionParams, function(value, key) {
            var type = serviceActionParamTypes[key];
            if(type === "Integer") {
                value = parseInt(value, 10);
            }
            else if(type === "Decimal") {
                value = parseFloat(value);
            }
            else if(type === "Boolean") {
                value = value === "true";
            }
            else if(type === "String" || type === "Id") {
                value = value;
            }
            else {
                value = window.$Utils.parseJSON(value);
            }
            return value;
        });

        var reportData = function(data) {
            console.log(data);
            component.set("v.serviceActionResult",
                _.isObject(data) ? window.$Utils.formatJSON(data) : _.toString(data)
            );
        };

        if(serviceAction.name) {
            // New Lightning Action
            window.$Utils.busyloading(component,
                window.$ActionService[currentServiceName].invoke(currentServiceActionName, params).then(reportData, reportData)
            );
        }
        else {
            window.$Utils.busyloading(component,
                window.$ActionService[currentServiceName].invokePlain(currentServiceActionName, params).then(reportData, reportData)
            );
        }
    },
})
