({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.initializeValues(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    handleSelected: function(cmp, event, helper) {
        helper.handleSelected(cmp);
    },

    renderRow: function(cmp, event, helper) {
        return helper.renderRow(cmp);
    },

    handleOnEvent: function(cmp, event, helper) {
        return helper.handleOnEvent(cmp, event);
    },
})
