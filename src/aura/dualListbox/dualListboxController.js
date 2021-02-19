({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "validityLibrary");

        var body = component.get('v.body');
        if (body && body.length > 0) {
            throw new Error('Invalid `body` attribute for <c:dualListbox> component. ' + 'Use the `value` attribute instead, E.g.: <c:dualListbox label="..." value="..." />');
        }

        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:dualListbox> component.' + 'The `label` attribute is required, E.g.: <c:dualListbox label="Resume" value="" />');
        }

        component.set("v.validity", {});

        helper.handleValueChange(component);
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

    handleRightButtonClick: function(component, event, helper) {
        helper.handleRightButtonClick(component, event);
    },

    handleLeftButtonClick: function(component, event, helper) {
        helper.handleLeftButtonClick(component, event);
    },

    handleUpButtonClick: function(component, event, helper) {
        helper.handleUpButtonClick(component, event);
    },

    handleDownButtonClick: function(component, event, helper) {
        helper.handleDownButtonClick(component, event);
    },
})
