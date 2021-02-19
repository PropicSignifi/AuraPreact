({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "utilsLibrary");

        helper.init(cmp);
    },

    handleSectionRegister: function(cmp, event, helper) {
        helper.handleSectionRegister(cmp, event);
    },

    handleSectionDeregister: function(cmp, event, helper) {
        helper.handleSectionDeregister(cmp, event);
    },

    handleSectionSelect: function(cmp, event, helper) {
        helper.handleSectionSelect(cmp, event);
    },

    handleActiveSectionNameChange: function(cmp, event, helper) {
        helper.handleActiveSectionNameChange(cmp, event);
    },

    handleSectionKeyNav: function(cmp, event, helper) {
        helper.handleSectionKeyNav(cmp, event);
    },
})
