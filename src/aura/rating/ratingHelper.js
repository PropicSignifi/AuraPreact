({
    computeStyle: function(cmp) {
        var style = cmp.get("v.style");
        var privateActiveIconName, privateActiveStyle, privateInactiveIconName, privateInactiveStyle;
        if(!style || style === 'favorite') {
            privateActiveIconName = "utility:favorite";
            privateActiveStyle = style + "-active";
            privateInactiveIconName = "utility:favorite";
            privateInactiveStyle = style + "-inactive";
        }

        cmp.set("v.privateActiveIconName", privateActiveIconName);
        cmp.set("v.privateActiveStyle", privateActiveStyle);
        cmp.set("v.privateInactiveIconName", privateInactiveIconName);
        cmp.set("v.privateInactiveStyle", privateInactiveStyle);
    },

    computeClassNames: function(component) {
        var value = ['slds-form-element'];

        var classAttr = component.get('v.class');
        if (classAttr) {
            value.push(classAttr);
        }
        var required = component.get('v.required');
        if (required) {
            value.push('is-required');
        }
        if (!this.isInputValid(component)) {
            value.push('slds-has-error');
        }
        if (component.get('v.variant') === 'label-hidden') {
            value.push('slds-form--inline');
        }

        component.set('v.privateComputedClass', value.join(' '));
    },

    isInputValid: function(component) {
        this.doCustomValidation(component);
        return this.validityLibrary.validity.isValid(component.get('v.validity'));
    },

    handleValueChange: function(cmp) {
        var options = cmp.get("v.options");
        var value = cmp.get("v.value");
        var privateOptions = options;
        var index = _.findIndex(privateOptions, function(option) {
            return option.value === value;
        });
        _.each(privateOptions, function(option, i) {
            option.$active = i <= index;
        });
        cmp.set("v.privateOptions", privateOptions);
    },

    handleOptionClick: function(cmp, event) {
        var target = event.currentTarget;
        var index = _.parseInt(target.getAttribute("data-index"));
        var privateOptions = cmp.get("v.privateOptions");
        var value = privateOptions[index].value;
        cmp.set("v.value", value);
        this.fireEvent(cmp, "onchange");
    },

    doCustomValidation: function(cmp) {
        var required = cmp.get("v.required");
        var value = cmp.get("v.value");
        var validity = cmp.get("v.validity");
        if(validity) {
            if(required && (_.isNull(value) || _.isUndefined(value))) {
                validity.valueMissing = true;
                validity.valid = false;
            }
            else {
                validity.valueMissing = false;
                validity.valid = true;
            }
        }
    },

    updateHelpMessage: function(component) {
        this.doCustomValidation(component);
        var validity = component.get('v.validity');
        var message = this.validityLibrary.validity.getMessage(component, validity);
        component.set('v.privateHelpMessage', message);
    },

    handleNodeBlur: function(component, domNode, event) {
        this.showHelpMessageIfInvalid(component);
        this.fireEvent(component, "onblur");
    },

    handleNodeFocus: function(component, domNode, event) {
        this.fireEvent(component, "onfocus");
    },

    setFocusOnDOMNode: function(component) {
    },

    showHelpMessageIfInvalid: function(component) {
        this.showHelpMessage(component);
    },

    showHelpMessage: function(component) {
        this.updateHelpMessage(component);
    },
})
