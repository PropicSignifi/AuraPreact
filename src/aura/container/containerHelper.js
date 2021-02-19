({
    initializeValues: function(cmp) {
        var body = cmp.get("v.body");
        var privateParameters = {};
        var privateExpressions = [];
        var privateTarget = null;

        _.each(body, function(child) {
            if(child.isInstanceOf(window.$Config.getNamespace() + ":parameter")) {
                privateParameters[child.get("v.name")] = child.get("v.value");
            }
            else if(child.isInstanceOf(window.$Config.getNamespace() + ":expression")) {
                privateExpressions.push({
                    name: child.get("v.name"),
                    inject: child.get("v.inject"),
                    value: child.get("v.value"),
                });
            }
            else {
                if(!privateTarget) {
                    privateTarget = child;
                }
            }
        });

        cmp.set("v.privateParameters", privateParameters);
        cmp.set("v.privateExpressions", privateExpressions);
        cmp.set("v.privateTarget", privateTarget);

        this.computeValues(cmp);
    },

    computeValues: function(cmp) {
        var privateParameters = cmp.get("v.privateParameters");
        var privateExpressions = cmp.get("v.privateExpressions");
        var privateTarget = cmp.get("v.privateTarget");

        var context = {};
        _.assign(context, privateParameters);
        _.each(privateExpressions, function(expression) {
            context[expression.name] = window.$Utils.evaluate(expression.value, context);
        });

        if(!privateTarget) {
            var text = context.text;
            var html = context.html;
            cmp.set("v.privateText", text);
            cmp.set("v.privateHtml", html);
        }
        else {
            _.chain(privateExpressions).
                filter(["inject", true]).
                map(function(expression) {
                    privateTarget.set("v." + expression.name, context[expression.name]);
                    return expression;
                }).
                value();
        }
    },

    handleParameterChange: function(cmp, event) {
        event.stopPropagation();
        var body = cmp.get("v.body");
        var privateParameters = cmp.get("v.privateParameters");

        _.each(body, function(child) {
            if(child.isInstanceOf(window.$Config.getNamespace() + ":parameter")) {
                privateParameters[child.get("v.name")] = child.get("v.value");
            }
        });

        cmp.set("v.privateParameters", privateParameters);

        this.computeValues(cmp);
    },
})
