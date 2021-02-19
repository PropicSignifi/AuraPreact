({
    onScriptsLoaded: function(component, event, helper) {
        helper.makeApexRequest(component, 'c.invoke', {
            name: 'getVisualforceDomainURL',
            args: {},
        }, {
            storable: true,
        }).then(function(vfDomainURL) {
            helper.handleOnPostmateScriptsLoaded(
                component,
                component.find('postmate').getElement(),
                `${vfDomainURL}/apex/APIPage`
            );
        }).catch($A.getCallback(function(err) {
            console.error('API: Error in script initialization', err);
        }));
    },

    onRestRequest: function(component, event, helper) {
        var params = event.getParam('arguments');
        return helper.handleRestRequest(component, params.request);
    },

    onHttpRequest: function(component, event, helper) {
        var params = event.getParam('arguments');
        return helper.handleHttpRequest(component, params.request);
    },
})
