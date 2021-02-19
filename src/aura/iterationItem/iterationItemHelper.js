({
    handleItemsChange: function(cmp, event) {
        var items = cmp.get("v.items");
        var index = cmp.get("v.index");
        var object = items[index];
        cmp.set("v.object", object);
    },

    renderItem: function(cmp, event) {
        var args = event.getParam('arguments');

        var template = cmp.get("v.template");
        var providers = cmp.get("v.providers");

        var comp = window.$Utils.fromXml(template, _.assign({}, providers, {
            _: cmp,
        }));
        window.$Utils.createComponent(comp).then(function(newComp) {
            cmp.set("v.body", []);
            var body = cmp.get("v.body");
            body.push(newComp);
            cmp.set("v.body", body);
            if(_.isFunction(args.callback)) {
                args.callback(newComp);
            }
        });
    },

    getItemUI: function(cmp) {
        return cmp.get("v.body");
    },
})
