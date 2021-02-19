({
    renderObjectEditor: function(cmp, event) {
        var args = event.getParam('arguments');
        var callback = args.callback;
        var object = cmp.get("v.object");
        var template = cmp.get("v.template");
        var editorConfig = cmp.get("v.editorConfig");
        var providers = cmp.get("v.providers") || {};
        providers._ = cmp;

        return window.$ObjectEditorTemplateManager.render(template, editorConfig, providers, {
            object: object,
        }).then(function(newComp) {
            cmp.set("v.body", []);
            var body = cmp.get("v.body");
            if(_.isArray(newComp)) {
                body = body.concat(newComp);
            }
            else {
                body.push(newComp);
            }
            cmp.set("v.body", body);

            if(_.isFunction(callback)) {
                callback();
            }
        });
    },
})
