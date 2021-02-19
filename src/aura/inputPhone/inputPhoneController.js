({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "validityLibrary");

        helper.initializeComputed(component);
        helper.computeClassNames(component);
        helper.handleValueChange(component);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    focus: function(component, event, helper) {
        // TODO
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    handleValueChange: function(cmp, event, helper) {
        helper.handleValueChange(cmp, event);
    },

    handleBlur: function(cmp, event, helper) {
        helper.handleBlur(cmp, event);
    },

    onCountryChange: function(cmp, event, helper) {
        helper.onCountryChange(cmp, event);
    },

    onNumberChange: function(cmp, event, helper) {
        helper.onNumberChange(cmp, event);
    },

    getCountryCode: function(cmp, event, helper) {
        return helper.getCountryCode(cmp, event);
    },

    getPhoneNumber: function(cmp, event, helper) {
        return helper.getPhoneNumber(cmp, event);
    },
})
