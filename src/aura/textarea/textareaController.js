({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");

        var body = component.get('v.body');
        if (body && body.length > 0) {
            throw new Error('Invalid `body` attribute for <c:textarea> component. ' + 'Use the `value` attribute instead, E.g.: <c:textarea label="..." value="..." />');
        }

        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:textarea> component.' + 'The `label` attribute is required, E.g.: <c:textarea label="Resume" value="" />');
        }
        helper.initializeInteractingState(component);
        helper.computeClassNames(component);
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
})
