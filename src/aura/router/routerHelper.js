({
    handleRouteChange: function(cmp, event) {
        var helper = this;
        var data = event.getParam("data");
        var name = cmp.get("v.name");
        var routes = cmp.get("v.routes");
        if(name === data.name && "onRouteChange" === data.type) {
            var routeName = data.routeName;
            var routeParams = data.routeParams;
            var route = _.find(routes, ["name", routeName]);
            if(route && route.template) {
                var msgs = window.$Utils.checkDirty(cmp);
                if(!_.isEmpty(msgs)) {
                    window.$Utils.getCurrentApp().alert({
                        header: "Unsaved Changes",
                        message: "You have unsaved changes. Do you want to discard?",
                        onSave: function() {
                            helper.continueRouting(cmp, route, routeParams);
                        },
                    });
                }
                else {
                    helper.continueRouting(cmp, route, routeParams);
                }
            }
        }
    },

    continueRouting: function(cmp, route, routeParams) {
        var params = _.assign({}, route.params, routeParams);
        cmp.set("v.data", params);
        var template = route.template;
        var comp = window.$Utils.fromXml(template, cmp);
        window.$Utils.busyloading(
            cmp,
            window.$Utils.createComponent(comp).then(function(newComp) {
                var container = cmp.find("container");
                container.set("v.body", []);
                var body = container.get("v.body");
                body.push(newComp);
                container.set("v.body", body);
            })
        );
    },
})
