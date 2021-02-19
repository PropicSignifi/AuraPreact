({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.bindInput(cmp);
        });
    },

    rerender: function(component, helper) {
        helper.renderGrid(component);
        this.superRerender();
    },

    unrender: function(component, helper) {
        helper.unbindInput(component);
        component.superUnrender();
    },
})
