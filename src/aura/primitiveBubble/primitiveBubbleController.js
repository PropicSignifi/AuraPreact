({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.updateClassList(cmp);
        cmp._inDOM = true;
    },

    doDestroy: function(cmp, event, helper) {
        cmp._inDOM = false;
    },

    setContent: function(cmp, event, helper) {
        if(cmp._inDOM) {
            helper.setContentManually(cmp);
        }
    },

    setAlign: function(cmp, event, helper) {
        helper.updateClassList(cmp);
    },

    setVisible: function(cmp, event, helper) {
        helper.updateClassList(cmp);
    },
})
