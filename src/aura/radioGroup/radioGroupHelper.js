({
    handleValueChange: function(cmp) {
        var options = cmp.get("v.privateOptions");
        var value = cmp.get("v.value");
        var option = _.find(options, ["value", value]);
        if(option) {
            _.each(options, function(o) {
                o.$selected = (o === option);
            });
            cmp.set("v.privateOptions", options);
        }
        else {
            option = options[0];
            if(option) {
                cmp.set("v.value", option.value);
            }
        }
    },

    handleOptionsChange: function(cmp) {
        var options = cmp.get("v.options");
        cmp.set("v.privateOptions", options);
        this.handleValueChange(cmp);
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
    },

    setFocusOnDOMNode: function(component) {
        var cmp = component.find("private")[0];
        if(cmp) {
            var domNode = cmp.getElement();
            domNode.focus();
        }
    },

    onClick: function(cmp, event) {
        event.stopPropagation();
        var clicked = event.getParam('data').cmp;
        var name = clicked.get("v.name");
        var index = _.parseInt(_.split(name, "-")[1]);
        var options = cmp.get("v.privateOptions");
        if(index >= 0) {
            var option = options[index];
            if(option) {
                cmp.set("v.value", option.value);
                this.fireEvent(cmp, "onchange");
            }
        }
    },
})
