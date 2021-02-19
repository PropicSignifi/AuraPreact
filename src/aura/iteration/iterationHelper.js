({
    getItemUIs: function(cmp) {
        return _.map(cmp.get("v.body"), function(item) {
            return item.getItemUI();
        });
    },

    renderItems: function(cmp, event) {
        var args = event.getParam('arguments');

        var oldBody = cmp.get("v.body");
        var items = cmp.get("v.items");
        if(_.size(oldBody) >= _.size(items)) {
            cmp.set("v.body", _.slice(oldBody, 0, _.size(items)));
            if(_.isFunction(args.callback)) {
                args.callback();
            }
        }
        else {
            if(cmp._timer) {
                window.clearInterval(cmp._timer);
            }

            var body = oldBody;

            cmp._isCreatingItem = false;
            cmp._timer = window.setInterval($A.getCallback(function() {
                if(cmp._isCreatingItem) {
                    return;
                }
                var template = cmp.get("v.template");
                var providers = cmp.get("v.providers");
                var items = cmp.get("v.items");
                var num = _.size(body);
                var sizeItems = _.size(items);
                if(num < sizeItems) {
                    var comp = window.$Utils.fromXml('<c:iterationItem items="{! v.items }" template="{! v.template }" providers="{! v.providers }" index="' + num + '"/>', _.assign({}, providers, { _: cmp, }));
                    cmp._isCreatingItem = true;
                    window.$Utils.createComponent(comp).then(function(newComp) {
                        newComp.renderItem(function() {
                            body.push(newComp);
                            cmp.set("v.body", body);
                            cmp._isCreatingItem = false;
                        });
                    });
                }
                else {
                    window.clearInterval(cmp._timer);
                    if(_.isFunction(args.callback)) {
                        args.callback();
                    }
                }
            }), 0);
        }
    },
})
