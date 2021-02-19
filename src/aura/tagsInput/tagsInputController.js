({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");

        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:tagsInput> component.' + 'The `label` attribute is required, E.g.: <c:tagsInput label="Resume" value="" />');
        }
        helper.initializeInteractingState(component);
        helper.computeClassNames(component);
        helper.initializeComputed(component);
        helper.appendToChild(component);
    },

    doDestroy: function(component, event, helper) {
        helper.doDestroy(component);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    focus: function(component, event, helper) {
        helper.setFocusOnDOMNode();
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    onClickItem: function(component, event, helper) {
        helper.onClickItem(component, event);
    },

    onRemoveTag: function(component, event, helper) {
        helper.onRemoveTag(component, event);
    },

    handleValueChange: function(component, event, helper) {
        helper.handleValueChange(component, event);
    },
})
