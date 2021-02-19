({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "IntlLibrary");

        cmp.set("v.privateFormattedValue", helper.getFormattedNumber(cmp));
    },

    handleValueChange: function(cmp, event, helper) {
        cmp.set("v.privateFormattedValue", helper.getFormattedNumber(cmp));
    },
})
