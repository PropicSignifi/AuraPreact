({
    init: function(cmp, event, helper) {
        window.$System.addLibrary(helper, "classnamesLibrary");

        helper.computeClassNames(cmp);
        helper.computeContainerClassNames(cmp);

        var icon = cmp.find("icon");
        icon.getElement().addEventListener("mouseover", $A.getCallback(function() {
            cmp.set("v.privateShowTooltip", true);
        }));
        icon.getElement().addEventListener("mouseout", $A.getCallback(function() {
            cmp.set("v.privateShowTooltip", false);
        }));

        helper.handleContentChange(cmp);
    },

    computeClassNames: function(cmp, event, helper) {
        helper.computeClassNames(cmp);
    },

    computeContainerClassNames: function(cmp, event, helper) {
        helper.computeContainerClassNames(cmp);
    },

    handleContentChange: function(cmp, event, helper) {
        helper.handleContentChange(cmp);
    },
})
