({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.computeContainerClassNames(cmp);
    },

    computeClassNamesAndUpdate: function(cmp, event, helper) {
        helper.computeClassNames(cmp);

        if (cmp.isRendered()) {
            helper.updateSVGClass(cmp);
        }
    },

    computeContainerClassNamesAndUpdate: function(cmp, event, helper) {
        helper.computeContainerClassNames(cmp);
    },

    updateSVG: function(cmp, event, helper) {
        helper.updateSVG(cmp);
    },
})
