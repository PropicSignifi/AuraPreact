({
    init: function(component, event, helper) {
        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:datetimePicker> component.' + 'The `label` attribute is required, E.g.: <c:datetimePicker label="Resume" value="" />');
        }
        helper.computeClassNames(component);
        helper.handleDateTimeValueChange(component, event);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    focus: function(component, event, helper) {
        component.find("date").focus();
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        component.find("date").showHelpMessageIfInvalid();
        component.find("time").showHelpMessageIfInvalid();
    },

    handleValueChange: function(component, event, helper) {
        helper.handleValueChange(component, event);
    },

    handleNodeBlur: function(component, event, helper) {
        helper.handleNodeBlur(component, event);
    },

    handleNodeFocus: function(component, event, helper) {
        helper.handleNodeFocus(component, event);
    },

    handleDateTimeValueChange: function(component, event, helper) {
        helper.handleDateTimeValueChange(component, event);
    },
})
