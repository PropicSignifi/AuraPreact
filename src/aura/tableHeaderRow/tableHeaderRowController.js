({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.addEventListeners(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    handleSelected: function(cmp, event, helper) {
        helper.handleSelected(cmp);
    },

    renderRow: function(cmp, event, helper) {
        return helper.renderRow(cmp);
    },

    handleOnEvent: function(cmp, event, helper) {
        return helper.handleOnEvent(cmp, event);
    },

    onResizeStart: function(cmp, event, helper) {
        return helper.onResizeStart(cmp, event);
    },

    onResizeHover: function(cmp, event, helper) {
        return helper.onResizeHover(cmp, event);
    },

    setTable: function(cmp, event, helper) {
        var args = event.getParam('arguments');
        if(args) {
            cmp.set("v.privateTable", args.table);
        }
    },
})
