({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");

        helper.initializeInteractingState(component);
        helper.computeClassNames(component);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    focus: function(component, event, helper) {
        helper.setFocusOnDOMNode(component);
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    onLookup: function(component, event, helper) {
        helper.onLookup(component, event);
    },

    setObject: function(component, event, helper) {
        helper.setObject(component, event);
    },

    handleValueChange: function(cmp, event, helper) {
        helper.handleValueChange(cmp, event);
    },
})
