({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.addListeners(cmp);
            helper.maybeCreateMenuItems(cmp);
        });
    },

    unrender: function(cmp, helper) {
        helper.cleanUp(cmp);
        cmp.superUnrender();
    },
})
