({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.addListeners(cmp);
            helper.fireRegisterEvent(cmp);
        });
    },

    unrender: function(cmp, helper) {
        helper.fireUnRegisterEvent(cmp);
        helper.removeListeners(cmp);
        cmp.superUnrender();
    },
})
