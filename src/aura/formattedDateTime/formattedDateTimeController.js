({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "IntlLibrary");
        window.$System.addLibrary(helper, "dateTimeUtils");

        cmp.set("v.privateFormattedValue", helper.getFormattedDateTime(cmp));
    },

    handleValueChange: function(cmp, event, helper) {
        cmp.set("v.privateFormattedValue", helper.getFormattedDateTime(cmp));
    }
})
