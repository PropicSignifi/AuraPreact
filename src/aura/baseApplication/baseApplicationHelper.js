({
    isReady: function(component) {
        return component._initialized && component._scriptsLoaded && component._scriptsLoaded.length === 4;
    },

    checkReady : function(component) {
        if(this.isReady(component) && !component._initFired) {
            component.set("v.loading", false);
            window.$Utils.setCurrentApp(component);
            component.set("v.privateAlert", {});
            window.$Utils.fireEvent(component, "$init");
            component._initFired = true;
        }
    },

    addDirtyCheck: function(component) {
        if(window.$Utils) {
            window.addEventListener("beforeunload", function(e) {
                var msgs = window.$Utils.checkDirty(component);
                var ret = !_.isEmpty(msgs) ? 'You have unsaved changes. Do you want to discard?' : '';
                if(ret) {
                    e.returnValue = ret;
                    return ret;
                }
            });
        }
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
