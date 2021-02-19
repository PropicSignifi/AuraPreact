({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");

        helper.initializeInteractingState(component);
        helper.computeClassNames(component);
        helper.initializeComputed(component);
        helper.appendToChild(component);
    },

    doDestroy: function(component, event, helper) {
        helper.doDestroy(component);
    },

    initializeValue: function(component, event, helper) {
        helper.initializeValue(component);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    handleValueChange: function(component, event, helper) {
        helper.handleValueChange(component);
    },

    focus: function(component, event, helper) {
        helper.setFocusOnDOMNode(component);
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    onTrigger: function(component, event, helper) {
        helper.trigger(component);
    },

    onRemovePill: function(component, event, helper) {
        helper.removePill(component, event);
    },

    handleNodeClick: function(component, event, helper) {
        helper.handleNodeClick(component, event);
    },
})
