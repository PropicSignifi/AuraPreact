({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.setContainerClassNames(cmp);
    },

    updateVisibility: function(cmp, event, helper) {
        helper.setContainerClassNames(cmp);
    },
})
