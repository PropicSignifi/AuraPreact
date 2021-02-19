({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.initializeValue(cmp);
            helper.bindInput(cmp);
        });
    },

    unrender: function(component, helper) {
        helper.unbindInput(component);
        component.superUnrender();
    },
})
