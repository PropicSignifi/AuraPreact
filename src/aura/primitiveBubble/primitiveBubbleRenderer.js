({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.setContentManually(cmp);
        });
    },
})
