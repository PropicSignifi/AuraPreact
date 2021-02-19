({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.computeBackdropClassNames(cmp);
        helper.appendToBody(cmp);
    },

    doDestroy: function(cmp, event, helper) {
        helper.doDestroy(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
        helper.computeBackdropClassNames(cmp);
    },

    show: function(component, event, helper) {
        helper.show(component, event);
    },

    hide: function(component, event, helper) {
        helper.hide(component, event);
    },
})
