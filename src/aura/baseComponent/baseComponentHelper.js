({
    isReady: function(component) {
        var c = component;
        while(c) {
            if(c._initialized && c._scriptsLoaded && c._scriptsLoaded.length === 4) {
                return true;
            }
            c = c.getSuper ? c.getSuper() : null;
        }

        return false;
    },

    invokeWhenReady: function(cmp, callback) {
        var helper = this;
        if(this.isReady(cmp)) {
            callback();
        }
        else {
            cmp._readyFnTimer = window.setInterval($A.getCallback(function() {
                if(helper.isReady(cmp)) {
                    callback();
                    window.clearInterval(cmp._readyFnTimer);
                }
            }), 0);
        }
    },

    checkReady : function(component) {
        if(this.isReady(component) && !component._initFired) {
            component.set("v.loading", false);
            window.$Utils.fireEvent(component, "$init");
            window.$Utils.fireEvent(component, "$heartbeat", {
                data: {
                    source: component,
                },
            });
            component._initFired = true;
        }
    },

    equal: function(s1, s2) {
        return (s1 || "").toLowerCase() === (s2 || "").toLowerCase();
    },

    fireEvent: function(cmp, name, data) {
        window.$Utils.fireEvent(cmp, name, {
            data: _.assign({
                cmp: cmp,
            }, data),
        });
    },

    fireAppEvent: function(name, data) {
        if(name.endsWith('appEvent')) {
            window.$Utils.fireAppEvent(name, {
                data: _.assign({
                }, data),
            });
        }
        else {
            window.$Utils.fireAppEvent(name, data);
        }
    },

    focus: function(cmp) {
        var element = cmp.getElement();
        if (element) {
            element.focus();
        }
    },

    routeTo: function(routerName, routeName, routeParams) {
        window.$Utils.routeTo(routerName, routeName, routeParams);
    },

    setComputed: function(cmp, computedProperties) {
        var handlers = window.$Computed.getComputedChangeHandlers(cmp, 'computed', computedProperties);
        _.each(handlers, function(handler, name) {
            if(name) {
                cmp.addValueHandler({
                    event: 'change',
                    value: 'v.' + name,
                    method: handler,
                });
            }

            handler();
        });
    },
})
