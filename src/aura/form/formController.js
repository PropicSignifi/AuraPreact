({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");
        window.$System.addLibrary(helper, "validityLibrary");

        helper.computeClassNames(cmp);
        helper.commitValues(cmp);
        helper.addListeners(cmp);
        helper.handleFormReadonly(cmp);
        helper.handleFormDisabled(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    validate: function(cmp, event, helper) {
        return helper.validate(cmp);
    },

    checkDirty: function(cmp, event, helper) {
        return helper.checkDirty(cmp);
    },

    save: function(cmp, event, helper) {
        return helper.save(cmp);
    },

    cancel: function(cmp, event, helper) {
        return helper.cancel(cmp);
    },

    handleFormReadonly: function(cmp, event, helper) {
        return helper.handleFormReadonly(cmp);
    },

    handleFormDisabled: function(cmp, event, helper) {
        return helper.handleFormDisabled(cmp);
    },

    getFields: function(cmp, event, helper) {
        return helper.getFields(cmp);
    },

    getValidFields: function(cmp, event, helper) {
        return helper.getValidFields(cmp);
    },
})
