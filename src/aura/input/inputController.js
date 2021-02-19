({
    init: function(component, event, helper) {
        window.$System.addLibrary(helper, "domLibrary");
        window.$System.addLibrary(helper, "validityLibrary");
        window.$System.addLibrary(helper, "IntlLibrary");
        window.$System.addLibrary(helper, "interactingStateLibrary");
        window.$System.addLibrary(helper, "utilsLibrary");

        helper.initializeInteractingState(component);
        helper.validateAllAttributes(component);
        helper.computeClassNames(component);
        helper.initializeDefaultValues(component);
    },

    handlePatternChange: function(component, event, helper) {
        helper.validateAttrPattern(component);
    },

    handleClassChange: function(component, event, helper) {
        helper.computeClassNames(component);
    },

    focus: function(component, event, helper) {
        helper.setFocusOnDOMNode(component);
    },

    clearAndSetFocusOnInput: function(component, event, helper) {
        helper.clearInputValue(component);
        helper.setFocusOnDOMNode(component);
    },

    handleDropFiles: function(component, event, helper) {
        helper.handleDropFiles(component, event);
    },

    showHelpMessageIfInvalid: function(component, event, helper) {
        helper.showHelpMessageIfInvalid(component);
    },

    handleKeyPress: function(component, event, helper) {
        var isTypeNumber = (component.get('v.type') === 'number');
        if (isTypeNumber && !helper.isFunctionKeyStroke(event) && !helper.isValidNumericKeyStroke(event)) {
            event.preventDefault();
        }
    },
})
