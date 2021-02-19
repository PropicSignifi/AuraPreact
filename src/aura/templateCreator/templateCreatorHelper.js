({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames(classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    handleTemplateChange: function(cmp) {
        var template = cmp.get("v.template");
        var comps = window.$Utils.fromXml(template, cmp);
        window.$Utils.busyloading(
            cmp,
            window.$Utils.createComponents(comps)
                .then(function(newComps) {
                    var container = cmp.find("container");
                    container.set("v.body", []);

                    var body = container.get("v.body");
                    body = body.concat(newComps);
                    container.set("v.body", body);
                }
            )
        );
    },
})
