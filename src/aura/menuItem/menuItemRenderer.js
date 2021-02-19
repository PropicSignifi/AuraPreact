({
    afterRender: function(cmp, helper) {
        cmp.superAfterRender();
        helper.invokeWhenReady(cmp, function() {
            helper.addListeners(cmp);
            helper.fireDomEvent(cmp, "MENUITEM_REGISTER");
        });
    },

    unrender: function(cmp, helper) {
        helper.fireDomEvent(cmp, "MENUITEM_DEREGISTER");
        helper.removeListeners(cmp);
        cmp.superUnrender();
    },
})
