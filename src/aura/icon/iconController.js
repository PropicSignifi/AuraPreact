({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");
        window.$System.addLibrary(helper, "propValuesLibrary");

        helper.normalizeVariant(cmp);
        helper.setContainerClassNames(cmp);
    },

    handleVariantChange: function(cmp, event, helper) {
        helper.normalizeVariant(cmp);
        helper.setContainerClassNames(cmp);
    },

    handleIconNameChange: function(cmp, event, helper) {
        helper.normalizeVariant(cmp);
        helper.setContainerClassNames(cmp);
    },

    setContainerClassNames: function(cmp, event, helper) {
        helper.setContainerClassNames(cmp);
    },
})
