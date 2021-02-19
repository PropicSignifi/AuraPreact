({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.computeSortedClassNames(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    computeSortedClassNames: function(cmp, event, helper) {
        helper.computeSortedClassNames(cmp);
    },

    onClick: function(cmp, event, helper) {
        helper.onClick(cmp, event);
    },
})
