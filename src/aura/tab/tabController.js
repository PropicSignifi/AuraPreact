({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");
        window.$System.addLibrary(helper, "eventRegistrationLibrary");
        window.$System.addLibrary(helper, "domLibrary");

        helper.setId(cmp);
        helper.computeStyles(cmp);
    },

    computeStyles: function(cmp, event, helper) {
        helper.computeStyles(cmp);
    },

    fire: function(cmp, event, helper) {
        helper.fireRegisterEvent(cmp);
    },

    deselect: function(cmp, event, helper) {
        cmp.set('v.privateSelected', false);
        helper.fireEvent(cmp, "oninactive");
    },

    setVariant: function(cmp, event) {
        var variant = event.getParam('arguments').variant;
        cmp.set('v.privateVariant', variant);
    },

    handleSelectedChange: function(cmp, event, helper) {
        helper.computeStyles(cmp);
    },

    select: function(cmp, event, helper) {
        var disabled = cmp.get("v.disabled");
        if(disabled) {
            return;
        }
        cmp.set('v.privateSelected', true);
        helper.fireSelectEvent(cmp);
    },

    handleBodyChange: function(cmp, event, helper) {
        helper.fireBodyChangeEvent(cmp);
    },

    focus: function(cmp, event, helper) {
        helper.setFocus(cmp);
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
})
