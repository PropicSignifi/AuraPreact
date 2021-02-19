({
    init: function(cmp, event, helper) {
        helper.initializeValue(cmp);
    },

    focus: function(cmp, event, helper) {
        helper.focus(cmp);
    },

    showHelpMessageIfInvalid: function(cmp, event, helper) {
        helper.showHelpMessageIfInvalid(cmp);
    },

    handleValueChange: function(cmp, event, helper) {
        helper.handleValueChange(cmp);
    },

    onValueChange: function(cmp, event, helper) {
        helper.onValueChange(cmp);
    },
})
