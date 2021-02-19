({
    doInit : function(component, event, helper) {
        component._initialized = true;
        helper.checkReady(component);
    },

    init : function(component, event, helper) {
        event.stopPropagation();
    },

    destroy : function(component, event, helper) {
        event.stopPropagation();
    },

    onScriptsLoaded : function(component, event, helper) {
        component._scriptsLoaded = component._scriptsLoaded || [];
        component._scriptsLoaded.push(true);
        helper.checkReady(component);
    },

    onLocationChange : function(component, event, helper) {
        if(window.$Utils) {
            window.$Utils.fireEvent(component, "$destroy");
        }
    },

    getChildren: function(component, event, helper) {
        var children = component.get("v.privateChildren") || [];
        children = _.filter(children, function(child) {
            return child.isValid && child.isValid();
        });
        component.set("v.privateChildren", children);
        return children;
    },

    heartbeat: function(component, event, helper) {
        var data = event.getParam("data");
        var child = $A.getComponent(data.source.getGlobalId());
        var self = $A.getComponent(component.getGlobalId());
        if(child === self) {
            return;
        }
        else {
            event.stopPropagation();
            var privateChildren = component.get("v.privateChildren") || [];
            if(!_.includes(privateChildren, child)) {
                privateChildren.push(child);
            }
            component.set("v.privateChildren", privateChildren);
        }
    },
})
