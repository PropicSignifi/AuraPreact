({
    loadDemoComponent : function(component, event, helper) {
        var demoComponent = component.find("demoComponent");
        demoComponent.load();
    },

    createConfigPanel : function(current, component) {
        var configPanel = component.find("configPanel");
        configPanel.set("v.body", []);

        var body = configPanel.get("v.body");
        var fields = window.DemoStore.getConfigFields(current, component);
        if(!_.isEmpty(fields)) {
            window.$Utils.busyloading(
                component,
                window.$Utils.createComponents(_.values(fields)).then(function(newComps) {
                    _.each(newComps, function(comp) {
                        body.push(comp);
                    });
                    configPanel.set("v.body", body);
                })
            );
        }
    },

    onExpressionActive: function(cmp) {
        cmp.set("v.privateEditingExpression", true);
    },

    onExpressionInactive: function(cmp) {
        cmp.set("v.privateEditingExpression", false);
    },
})
