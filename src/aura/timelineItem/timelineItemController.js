({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        var iconName = cmp.get("v.iconName");
        if(!iconName) {
            iconName = "standard:" + cmp.get("v.variant");
            cmp.set("v.iconName", iconName);
        }
        helper.computeClassNames(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },
})
