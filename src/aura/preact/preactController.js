({
    init: function(cmp, event, helper) {
        helper.doPreactInit(cmp);
    },

    handlePropsChange: function(cmp, event, helper) {
        helper.handlePropsChange(cmp);
    },

    handleValueChange: function(cmp, event, helper) {
        helper.handleValueChange(cmp, event);
    },

    handlePreactletChange: function(cmp, event, helper) {
        helper.handlePreactletChange(cmp, event);
    },

    forceReload: function(component, event, helper) {
        helper.renderPreact(component);
    },

    startLoading: function(component, event, helper) {
        helper.startLoading(component);
    },

    stopLoading: function(component, event, helper) {
        helper.stopLoading(component);
    },

    handleApplicationEvent: function(component, event, helper) {
        helper.handleApplicationEvent(component, event);
    },

    registerPreactlet: function(component, event, helper) {
        return helper.registerPreactlet(component, event);
    },

    wrap: function(component, event, helper) {
        return helper.wrap(component, event);
    },

    requireComponent: function(component, event, helper) {
        return helper.requireComponent(component, event);
    },

    handleSave: function(cmp, event, helper) {
        helper.handleSave(cmp, event);
    },

    requireApiProxy: function(component, event, helper) {
        return helper.requireApiProxy(component, event);
    },

    requireLibrary: function(component, event, helper) {
        return helper.requireLibrary(component, event);
    },
})
