({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.handleTemplateChange(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    handleTemplateChange: function(cmp, event, helper) {
        helper.handleTemplateChange(cmp);
    },
})
