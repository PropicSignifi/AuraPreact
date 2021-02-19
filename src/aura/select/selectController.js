({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");

        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:select> component.' + 'The `label` attribute is required, E.g.: <c:select label="Choose One" value="">...</c:select>');
        }
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
})
