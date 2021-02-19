({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.adjustCloseButtonClass(cmp);
        helper.computeCurrentValue(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    computeCurrentValue: function(cmp, event, helper) {
        helper.computeCurrentValue(cmp);
    },
})
