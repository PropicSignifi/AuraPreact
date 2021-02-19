({
    onInit : function(component, event, helper) {
        window.DemoStore.addListener("DemoApp", function(changes, computedChanges) {
            var state = window.DemoStore.getState();
            var computedState = window.DemoStore.getComputedState();
            if(changes.contains("current")) {
                component.set("v.compParams", window.$Utils.formatJSON(state.currentParams));
                component.set("v.params", _.cloneDeep(state.currentParams));
            }
            if(computedChanges.contains("currentCompName")) {
                component.set("v.compName", computedState.currentCompName);
            }
            if(computedChanges.contains("currentDescription")) {
                component.set("v.description", computedState.currentDescription);
            }
            if(computedChanges.contains("currentRequires")) {
                component.set("v.requires", computedState.currentRequires);
            }
            if(changes.contains("currentParams")) {
                component.set("v.params", _.cloneDeep(state.currentParams));
                if(state.current) {
                    helper.loadDemoComponent(component, event, helper);
                }
            }
        });

        var demoComponents = window.DemoStore.getState().demoComponents;
        component.set("v.demoComponents", demoComponents);
        component.set("v.stats", window.DemoStore.getDemoComponentStats());
        component.set("v.privateNewlyAdded",
            _.chain(window.DemoStore.getNewlyAddedDemoComponents())
             .map("name")
             .join(", ")
             .value()
        );
        component.set("v.privateNoCreated",
            _.chain(window.DemoStore.getNoCreatedDemoComponents())
             .map("name")
             .join(", ")
             .value()
        );
        component.set("v.privateExpression", "");
        var privateOptions = [];
        privateOptions.push({
            label: "-- Select --",
            value: "",
        });
        _.each(demoComponents, function(comp) {
            privateOptions.push({
                label: comp.name,
                value: comp.name,
            });
        });
        component.set("v.privateOptions", privateOptions);

        $A.util.addClass(component.find("placeholder"), "slds-hide");
        $A.util.removeClass(component.find("app"), "slds-hide");

        component.set("v.namespace", window.$Config.getNamespace());
    },

    onDestroy : function(component, event, helper) {
        window.DemoStore.removeListener("DemoApp");
    },

    onTryComp : function(component, event, helper) {
        var privateEditingExpression = component.get("v.privateEditingExpression");
        if(privateEditingExpression) {
            var expression = component.get("v.privateExpression");
            var demoComponent = component.find("demoComponent");
            component.set("v.privateExpressionResult", demoComponent.evaluate(expression));
        }
        else {
            var compParams = component.get("v.compParams");
            window.DemoStore.dispatch(window.DemoStore.Updates.setParams(compParams));
        }
    },

    selectComp : function(component, event, helper) {
        var name = component.get("v.name");
        window.DemoStore.dispatch(window.DemoStore.Updates.setCurrent(name));
        component.set("v.selectedTabId", "json");
    },

    onConfigActive : function(component, event, helper) {
        var name = component.get("v.name");
        helper.createConfigPanel(name, component);
    },

    onConfigChange : function(component, event, helper) {
        var source = event.getSource();
        var name = component.get("v.name");
        var demoComp = window.DemoStore.getDemoComponent(name);
        if(demoComp && source && demoComp.configurable) {
            var changeName = source.get("v.name");
            var changeValue = null;
            if(demoComp.configurable[changeName] === "Boolean") {
                changeValue = source.get("v.checked");
            }
            else {
                changeValue = source.get("v.value");
            }

            var compParams = component.get("v.compParams");
            var json = window.$Utils.parseJSON(compParams);
            var change = {};
            change[changeName] = changeValue;
            var newCompParams = window.$Utils.formatJSON(
                _.assign({}, json, change)
            );
            component.set("v.compParams", newCompParams);
        }
    },

    onExpressionActive: function(cmp, event, helper) {
        helper.onExpressionActive(cmp, event);
    },

    onExpressionInactive: function(cmp, event, helper) {
        helper.onExpressionInactive(cmp, event);
    },
})
