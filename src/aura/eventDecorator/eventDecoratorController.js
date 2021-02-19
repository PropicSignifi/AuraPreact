({
    doInit: function(cmp, event, helper) {
    },

    emitNewEvent: function(cmp, event, helper) {
        var eventName = cmp.get("v.eventName");
        if(event.getName() === eventName) {
            var newEvent = cmp.getEvent("onEvent");
            newEvent.setParams({
                data: {
                    param1: cmp.get("v.param1"),
                    param2: cmp.get("v.param2"),
                    param3: cmp.get("v.param3"),
                    event: event,
                }
            });
            newEvent.fire();
        }
    },
})
