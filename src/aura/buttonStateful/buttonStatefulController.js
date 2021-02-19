({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.init(cmp);
    },

    handleClassChange: function(cmp, event, helper) {
        helper.handleClassChange(cmp);
    },

    handleVariantChange: function(cmp, event, helper) {
        helper.handleVariantChange(cmp);
    },

    handleStateChange: function(cmp, event, helper) {
        helper.handleStateChange(cmp);
    },

    handlePrivateIsClickedChange: function(cmp, event, helper) {
        helper.handlePrivateIsClickedChange(cmp);
    },

    handleClick: function(cmp, event, helper) {
        helper.handleClick(cmp, event);
    },

    handleFocus: function(cmp, event, helper) {
        helper.handleFocus(cmp, event);
    },

    handleBlur: function(cmp, event, helper) {
        helper.handleBlur(cmp, event);
    },

    focus: function(cmp) {
        var buttonElement = cmp.getElement();
        if (buttonElement) {
            buttonElement.focus();
        }
    },
})
