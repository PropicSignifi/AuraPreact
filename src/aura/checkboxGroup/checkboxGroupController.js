({
    init: function(component, event, helper) {
        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:checkboxGroup> component.' + 'The `label` attribute is required, E.g.: <c:checkboxGroup label="Resume" value="" />');
        }
        helper.computeClassNames(component);
        helper.handleOptionsChange(component);
        helper.handleValueChange(component);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    handleValueChange: function(component, event, helper) {
        helper.handleValueChange(component);
    },

    handleOptionsChange: function(component, event, helper) {
        helper.handleOptionsChange(component);
    },

    focus: function(component, event, helper) {
        helper.setFocusOnDOMNode();
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    onClick: function(cmp, event, helper) {
        helper.onClick(cmp, event);
    },
})
