({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.handleCreateComponent(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    handleCreateComponent: function(cmp, event, helper) {
        helper.handleCreateComponent(cmp);
    },

    handleParameterChange: function(cmp, event, helper) {
        helper.handleParameterChange(cmp);
    },

    getCreated: function(component, event, helper) {
        return component.get("v.privateCreated");
    },
})
