({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeContainerClassNames(cmp);
        helper.computeClassNames(cmp);
        helper.computeIconName(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    computeContainerClassNames: function(cmp, event, helper) {
        helper.computeContainerClassNames(cmp);
    },

    computeIconName: function(cmp, event, helper) {
        helper.computeIconName(cmp);
    },

    onClose: function(cmp, event, helper) {
        helper.closeToast(cmp);
    },

    monitorToast: function(cmp, event, helper) {
        var visible = cmp.get("v.visible");
        var wait = cmp.get("v.wait");
        var timer;
        if(visible) {
            timer = setTimeout($A.getCallback(function() {
                cmp.set("v.visible", false);
                timer = null;
            }), wait);
        }
        else {
            if(timer) {
                clearTimeout(timer);
            }
        }
    },
})
