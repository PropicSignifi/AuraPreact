({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
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

    focus: function(cmp, event, helper) {
        helper.focus(cmp);
    },
})
