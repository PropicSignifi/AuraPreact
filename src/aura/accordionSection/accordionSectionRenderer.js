({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.registerSectionOnParent(cmp);
        });
    },

    unrender: function(cmp, helper) {
        helper.deregisterSectionOnParent(cmp);
        cmp.superUnrender();
    },
})
