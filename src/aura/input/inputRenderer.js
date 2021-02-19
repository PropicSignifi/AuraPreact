({
    afterRender: function(component, helper) {
        component.superAfterRender();
        helper.invokeWhenReady(component, function() {
            helper.bindInput(component);
        });
    },

    unrender: function(component, helper) {
        helper.unbindInput(component);
        component.superUnrender();
    },
})
