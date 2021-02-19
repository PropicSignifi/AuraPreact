({
    initializeComputed: function(cmp) {
        cmp.set("v.validity", {});
        this.setComputed(cmp, {
            picklistConfigurer: function() {
                return {
                    getTotalSelectionLabel: function(selections) {
                        var selection = selections[0];
                        return "+" + selection.value;
                    },
                };
            },
        });
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
        if (component.get('v.variant') === 'label-hidden') {
            value.push('slds-form--inline');
        }

        component.set('v.privateComputedClass', value.join(' '));

        value = [];

        if (!this.isInputValid(component)) {
            value.push('slds-has-error');
        }

        component.set('v.privateComputedInputClass', value.join(' '));
    },

    handleValueChange: function(cmp, event) {
        var countries = cmp.get("v.countries");
        var value = cmp.get("v.value");
        var privateCountries = countries;
        cmp.set("v.privateCountries", privateCountries);

        if(value) {
            var items = value.split(" ");
            var countryPart = items[0];
            var numberPart = _.drop(items, 1).join(" ");
            cmp.set("v.privateCountryCode", _.parseInt(countryPart));
            cmp.set("v.privateNumber", numberPart);
        }
        else {
            if(!_.isEmpty(privateCountries) && !cmp.get("v.privateCountryCode")){
                cmp.set("v.privateCountryCode", privateCountries[0].value);
                this.handleCountryChange(cmp);
            }
            cmp.set("v.privateNumber", null);
        }
    },

    updateHelpMessage: function(component) {
        this.doCustomValidation(component);
        var validity = component.get('v.validity');
        var message = this.validityLibrary.validity.getMessage(component, validity);
        component.set('v.privateHelpMessage', message);
    },

    showHelpMessageIfInvalid: function(component) {
        this.showHelpMessage(component);
    },

    showHelpMessage: function(component) {
        this.updateHelpMessage(component);
        this.computeClassNames(component);
    },

    isInputValid: function(component) {
        return this.validityLibrary.validity.isValid(component.get('v.validity'));
    },

    handleCountryChange: function(cmp, event) {
        var privateCountryCode = cmp.get("v.privateCountryCode");
        var formatter = "phone:" + privateCountryCode;
        cmp.set("v.privateFormatter", formatter);
    },

    doCustomValidation: function(cmp) {
        var required = cmp.get("v.required");
        var privateNumber = cmp.get("v.privateNumber");
        var privateCountryCode = cmp.get("v.privateCountryCode");
        var type = cmp.get("v.type");
        var validity = cmp.get("v.validity");
        var formatter = window.$Formatter.getFormatter("phone");
        if(validity) {
            if(required && !privateNumber) {
                validity.valueMissing = true;
                validity.patternMismatch = false;
                validity.valid = false;
            }
            else if(!formatter.isValid(privateNumber, {
                args: [privateCountryCode, type],
            })) {
                validity.valueMissing = false;
                validity.patternMismatch = true;
                validity.valid = false;
            }
            else {
                validity.valueMissing = false;
                validity.patternMismatch = false;
                validity.valid = true;
            }
        }
    },

    handleBlur: function(cmp) {
        this.showHelpMessageIfInvalid(cmp);
        this.fireEvent(cmp, "onblur");
    },

    fireValueChange: function(cmp) {
        var privateCountryCode = cmp.get("v.privateCountryCode");
        var privateNumber = cmp.get("v.privateNumber");
        if(privateNumber) {
            var formatter = window.$Formatter.getFormatter("phone");
            var value = formatter.getFullValue(privateNumber, {
                args: [privateCountryCode],
            });
            cmp.set("v.value", value);
        }
        else {
            cmp.set("v.value", null);
        }
        this.fireEvent(cmp, "onchange");
    },

    onCountryChange: function(cmp) {
        this.handleCountryChange(cmp);
        this.showHelpMessageIfInvalid(cmp);
        this.fireValueChange(cmp);
    },

    onNumberChange: function(cmp) {
        this.fireValueChange(cmp);
    },

    getCountryCode: function(cmp) {
        return cmp.get("v.privateCountryCode");
    },

    getPhoneNumber: function(cmp) {
        return cmp.get("v.privateNumber");
    },
})
