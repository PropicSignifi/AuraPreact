({
    onEvent : function(component, event, helper) {
        window.alert("Received event: " + event.getName() + " Event Source: " + event.getSource());
    },

    computeCompData : function(component, event, helper) {
        var compName = component.get("v.compName");
        if(compName) {
            component.set("v.isCustomComp", compName.startsWith("c:"));
        }
    },

    evaluate : function(component, event, helper) {
        var args = event.getParam("arguments");
        if(args && args.expression) {
            var expression = args.expression;
            var result = window.$Utils.evaluate(expression, _.assign({}, window, {
                comp: component.get("v.createdComp"),
            }));
            return _.toString(result);
        }
    },

    trigger : function(component, event, helper) {
        var params = component.get("v.params");
        var compName = component.get("v.compName");
        var createdComp = component.get("v.createdComp");
        var triggerFunc = component.get("v.triggerFunc");
        if(_.isFunction(triggerFunc)) {
            triggerFunc(compName, params, createdComp, event, component);
        }
    },

    load : function(component, event, helper) {
        var params = component.get("v.params");
        var compName = component.get("v.compName");
        var demoComp = component.get("v.demoComp");
        if(!compName && !demoComp) {
            throw new Error("Either compName or demoComp should be provided");
        }
        if(!compName) {
            compName = demoComp.componentName;
        }
        if(!demoComp) {
            demoComp = window.DemoStore.getDemoComponentByCompName(compName);
            var requiredAttributes = "";
            if(demoComp.mandatory) {
                requiredAttributes = _.join(demoComp.mandatory, ",");
            }
            component.set("v.privateRequiredAttributes", requiredAttributes);
        }
        var comp = window.$Utils.comp(compName, params);
        if(demoComp) {
            if(_.isFunction(demoComp.onTrigger)) {
                component.set("v.triggerFunc", demoComp.onTrigger);
            }
            if(_.isFunction(demoComp.createComp)) {
                comp = demoComp.createComp(compName, params, component);
                if(_.isString(comp)) {
                    comp = window.$Utils.fromXml(comp, component);
                }
            }
            if(_.isArray(demoComp.events)) {
                _.each(demoComp.events, function(eventName) {
                    comp.attrs[eventName] = component.getReference("c.onEvent");
                });
            }
        }
        var compXML = window.$Utils.toXML(comp);
        component.set("v.xml", compXML);
        component.set("v.privateCreateComp", demoComp.createComp ? _.toString(demoComp.createComp) : "");
        component.set("v.privateAfterRender", demoComp.afterRender ? _.toString(demoComp.afterRender) : "");
        component.set("v.privateOnTrigger", demoComp.onTrigger ? _.toString(demoComp.onTrigger) : "");
        window.$Utils.busyloading(
            component,
            window.$Utils.createComponent(comp)
                .then(function(newComp) {
                    var container = component.find("container");
                    container.set("v.body", []);

                    var body = container.get("v.body");
                    body.push(newComp);
                    container.set("v.body", body);

                    component.set("v.createdComp", newComp);

                    if(demoComp && _.isFunction(demoComp.afterRender)) {
                        demoComp.afterRender(newComp);
                    }
                }
            )
        );
    },

    onViewComponentDoc : function(component, event, helper) {
        var compName = component.get("v.compName");
        var type = "component";
        var url = "/auradocs/reference.app#reference?descriptor=" + compName + "&defType=" + type;
        window.$Utils.openUrl(url);
    },

    onViewComponentDocNew : function(component, event, helper) {
        var compName = component.get("v.compName");
        var url = "/componentReference/suite.app?page=" + compName;
        window.$Utils.openUrl(url);
    },

    onViewComponentRef : function(component, event, helper) {
        var compName = component.get("v.compName");
        var url = "https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/aura_compref_" +
            compName.replace(":", "_") +
            ".htm";
        window.$Utils.openUrl(url);
    },
})
