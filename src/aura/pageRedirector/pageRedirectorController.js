({
    init: function(cmp, event, helper) {
        var homeEvent = $A.get("e.force:navigateToObjectHome");
        homeEvent.setParams({
            "scope": cmp.get("v.sObjectName"),
            "resetHistory": true,
        });
        homeEvent.fire();
    },
})
