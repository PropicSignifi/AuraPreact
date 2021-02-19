({
    init: function(cmp, event, helper) {
    },

    setVisible: function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args) {
            var visible = args.visible;
            component.set("v.privateVisible", visible);
        }
    },
})
