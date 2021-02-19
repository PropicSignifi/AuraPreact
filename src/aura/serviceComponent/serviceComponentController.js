({
    onInit : function(component, event, helper) {
        component = component.getConcreteComponent();
        var serviceName = component.get("v.serviceName");
        window.$ActionService.install(serviceName, component);
    },

    onDestroy : function(component, event, helper) {
        component = component.getConcreteComponent();
        var serviceName = component.get("v.serviceName");
        // window.$ActionService.uninstall(serviceName);
    },
})
