({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");
        window.$System.addLibrary(helper, "propValuesLibrary");

        helper.fixPropValues(cmp);
        helper.setTitleValue(cmp);
        helper.checkIconType(cmp);
        helper.setIconClass(cmp);
        helper.computeButtonClassNames(cmp);
    },

    updatePrivateAttributes: function(cmp, event, helper) {
        helper.fixPropValues(cmp);
        helper.setTitleValue(cmp);
        helper.checkIconType(cmp);
        helper.setIconClass(cmp);
        helper.computeButtonClassNames(cmp);
    },

    handleIconClassChange: function(cmp, event, helper) {
        helper.setIconClass(cmp);
    },

    handleClick: function(cmp, event, helper) {
        helper.fireEvent(cmp, "onclick", {
            event: event,
        });
    },

    handleFocus: function(cmp, event, helper) {
        helper.fireEvent(cmp, "onfocus", {
            event: event,
        });
    },

    handleBlur: function(cmp, event, helper) {
        helper.fireEvent(cmp, "onblur", {
            event: event,
        });
    },

    focus: function(cmp) {
        var buttonElement = cmp.getElement();
        if (buttonElement) {
            buttonElement.focus();
        }
    },
})
