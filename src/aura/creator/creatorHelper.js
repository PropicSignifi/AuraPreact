({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames(classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    handleCreateComponent: function(cmp) {
        var helper = this;
        var componentName = cmp.get("v.componentName");
        var interfaceName = cmp.get("v.interfaceName");
        if(!componentName) {
            throw new Error("Component name is required.");
        }
        var params = {};
        var body = cmp.get("v.body");
        _.each(body, function(child) {
            if(child.isInstanceOf(window.$Config.getNamespace() + ":parameter")) {
                params[child.get("v.name")] = child.get("v.value");
            }
        });
        var comp = window.$Utils.comp(componentName, params);

        window.$Utils.busyloading(
            cmp,
            window.$Utils.createComponent(comp)
                .then(function(newComp) {
                    if(interfaceName && !newComp.isInstanceOf(interfaceName)) {
                        throw new Error("Component is not instance of " + interfaceName);
                    }

                    var container = cmp.find("container");
                    container.set("v.body", []);

                    var body = container.get("v.body");
                    body.push(newComp);
                    container.set("v.body", body);

                    cmp.set("v.privateCreated", newComp);

                    helper.fireEvent(cmp, "onCreated");
                }
            )
        );
    },

    handleParameterChange: function(cmp) {
        var privateCreated = cmp.get("v.privateCreated");
        if(privateCreated) {
            var body = cmp.get("v.body");
            _.each(body, function(child) {
                if(child.isInstanceOf(window.$Config.getNamespace() + ":parameter")) {
                    privateCreated.set("v." + child.get("v.name"), child.get("v.value"));
                }
            });
        }
    },
})
