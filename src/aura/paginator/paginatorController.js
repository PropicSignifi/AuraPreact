({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.computePagination(cmp);
        helper.gotoPage(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    computePagination: function(cmp, event, helper) {
        helper.computePagination(cmp);
    },

    gotoPage: function(cmp, event, helper) {
        helper.gotoPage(cmp, event);
    },

    handleSizeChange: function(cmp, event, helper) {
        helper.handleSizeChange(cmp, event);
    },
})
