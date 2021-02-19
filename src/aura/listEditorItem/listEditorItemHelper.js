({
    initItemEditor: function(cmp, event) {
        var object = cmp.get("v.object");
        var index = cmp.get("v.index");
        var itemsConfig = cmp.get("v.itemsConfig");
        if(itemsConfig && _.isFunction(itemsConfig.createEditor)) {
            var editor = itemsConfig.createEditor(object, index, cmp);
            if(_.isString(editor)) {
                editor = window.$Utils.fromXml(editor, cmp);
            }

            window.$Utils.busyloading(
                cmp,
                window.$Utils.createComponent(editor).then(function(newComp) {
                    var container = cmp.find("container");
                    container.set("v.body", []);

                    var body = container.get("v.body");
                    body.push(newComp);
                    container.set("v.body", body);
                })
            );
        }
    },
})
