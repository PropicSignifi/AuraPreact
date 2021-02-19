({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.removeSVG(cmp);
            helper.injectSVG(cmp);
        });
    },
})
