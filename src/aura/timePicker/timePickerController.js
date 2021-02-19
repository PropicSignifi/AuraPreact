({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");

        var label = component.get('v.label');
        if (!label || label.length === 0) {
            $A.warning('Invalid `label` attribute for <c:timePicker> component.' + 'The `label` attribute is required, E.g.: <c:timePicker label="Resume" value="" />');
        }
        helper.initializeInteractingState(component);
        helper.computeClassNames(component);
        helper.appendToChild(component);
        helper.generateOptions(component);

        var value = component.get("v.time");
        var time = component.get("v.value");
        if(value && !time) {
            time = helper.parseTime(value);
            component.set("v.value", time);
        }
        else {
            if(!value && !time) {
                component.set("v.time", "");
            }
            else {
                value = helper.formatTime(time);
                component.set("v.time", value);
            }
        }
    },

    doDestroy: function(component, event, helper) {
        helper.doDestroy(component);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    focus: function(component, event, helper) {
        helper.setFocusOnDOMNode();
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    handleNodeClick: function(component, event, helper) {
        helper.handleNodeClick(component, event);
    },

    handleTimeValueChange: function(component, event, helper) {
        helper.handleTimeValueChange(component, event);
    },
})
