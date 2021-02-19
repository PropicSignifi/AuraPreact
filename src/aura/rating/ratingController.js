({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "validityLibrary");

        var body = component.get('v.body');
        if (body && body.length > 0) {
            throw new Error('Invalid `body` attribute for <c:rating> component. ' + 'Use the `value` attribute instead, E.g.: <c:rating label="..." value="..." />');
        }

        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:rating> component.' + 'The `label` attribute is required, E.g.: <c:rating label="Resume" value="" />');
        }

        component.set("v.validity", {});

        helper.computeClassNames(component);
        helper.computeStyle(component);
        helper.handleValueChange(component);
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

    handleValueChange: function(component, event, helper) {
        helper.handleValueChange(component);
    },

    handleOptionClick: function(component, event, helper) {
        helper.handleOptionClick(component, event);
    },

    handleNodeFocus: function(component, event, helper) {
        helper.handleNodeFocus(component, event);
    },

    handleNodeBlur: function(component, event, helper) {
        helper.handleNodeBlur(component, event);
    },
})
