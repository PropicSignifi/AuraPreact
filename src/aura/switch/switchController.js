({
    init: function(cmp, event, helper) {
        helper.computeCaseChange(cmp);
    },

    switchToCase: function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            var caseName = args.case;
            component.set("v.case", caseName);
        }
    },

    computeCaseChange: function(cmp, event, helper) {
        helper.computeCaseChange(cmp, event);
    },
})
