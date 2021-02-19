({
    init: function(cmp, event, helper) {
        helper.initializeComputed(cmp);
        helper.computeItems(cmp);
    },

    handlePageChange: function(cmp, event, helper) {
        return helper.handlePageChange(cmp, event);
    },
})
