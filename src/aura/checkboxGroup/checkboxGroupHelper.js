({
    handleValueChange: function(cmp) {
        var options = cmp.get("v.options");
        var value = cmp.get("v.value");
        _.each(options, function(option) {
            option.$selected = _.includes(value, option.value);
        });
        cmp.set("v.options", options);
    },

    handleOptionsChange: function(cmp) {
        var options = cmp.get("v.options");
        cmp.set("v.privateOptions", options);
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
        var index = _.parseInt(clicked.get("v.name"));
        var options = cmp.get("v.options");
        if(index >= 0) {
            var option = options[index];
            if(option) {
                var selectedValues = _.chain(options).
                    filter(["$selected", true]).
                    map("value").
                    value();
                cmp.set("v.value", selectedValues);
                this.fireEvent(cmp, "onchange");
            }
        }
    },
})
