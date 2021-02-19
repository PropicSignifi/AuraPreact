({
    doInit : function(component, event, helper) {
        const userId = $A.get('$SObjectType.CurrentUser.Id');
        const personalizedApp = $A.get('$Resource.ctcPropertyLightningApp' + userId);
        if(personalizedApp) {
            component.set('v.personalized', userId);
        }
        component.set('v.personalizedChecked', true);
        component._initialized = true;
        helper.checkReady(component);
        helper.addDirtyCheck(component);
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

    alert: function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            component.set("v.privateAlert", _.assign({
                header: "Are you sure?",
                message: "Do you want to continue?",
                onSaveText: "Yes",
                onCancelText: "Cancel",
            }, args.options));
            component.find("alertModal").show();
        }
    },

    toast: function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            component.set("v.privateToast", _.assign({
                visible: true,
                variant: "info",
            }, args.options));
        }
    },

    onAlertSave: function(component, event, helper) {
        var alert = component.get("v.privateAlert");
        if(_.isFunction(alert.onSave)) {
            if(false !== alert.onSave()) {
                alert.visible = false;
                component.find("alertModal").hide();
                component.set("v.privateAlert", alert);
            }
        }
        else {
            alert.visible = false;
            component.find("alertModal").hide();
            component.set("v.privateAlert", alert);
        }
    },

    onAlertOther: function(component, event, helper) {
        var alert = component.get("v.privateAlert");
        if(_.isFunction(alert.onOther)) {
            if(false !== alert.onOther()) {
                alert.visible = false;
                component.find("alertModal").hide();
                component.set("v.privateAlert", alert);
            }
        }
        else {
            alert.visible = false;
            component.find("alertModal").hide();
            component.set("v.privateAlert", alert);
        }
    },

    onAlertCancel: function(component, event, helper) {
        var alert = component.get("v.privateAlert");
        if(_.isFunction(alert.onCancel)) {
            alert.onCancel();
        }
        alert.visible = false;
        component.find("alertModal").hide();
        component.set("v.privateAlert", alert);
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
