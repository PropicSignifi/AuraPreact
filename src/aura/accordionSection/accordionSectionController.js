({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "utilsLibrary");
    },

    handleKeyDown: function(cmp, event, helper) {
        helper.handleKeyDown(cmp, event);
    },

    handleSelectSection: function(cmp, event, helper) {
        helper.handleSelectSection(cmp);
    },
})
