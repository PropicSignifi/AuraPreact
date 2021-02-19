({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            window.setTimeout($A.getCallback(function() {
                helper.openSectionAfterRender(cmp);
            }), 0);
        });
    },
})
