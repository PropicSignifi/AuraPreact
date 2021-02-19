({
    handleLeftButtonClick: function(cmp) {
        var options = cmp.get("v.options");
        var value = cmp.get("v.value");
        var option = _.find(options, ["$selected", true]);
        if(option && _.includes(value, option.value)) {
            _.pull(value, option.value);
            cmp.set("v.value", value);
            this.fireEvent(cmp, "onchange");
        }
    },

    handleRightButtonClick: function(cmp) {
        var options = cmp.get("v.options");
        var value = cmp.get("v.value");
        var option = _.find(options, ["$selected", true]);
        if(option && !_.includes(value, option.value)) {
            value.push(option.value);
            cmp.set("v.value", value);
            this.fireEvent(cmp, "onchange");
        }
    },

    swap: function(array, index1, index2) {
        var tmp = array[index1];
        array[index1] = array[index2];
        array[index2] = tmp;
    },

    handleUpButtonClick: function(cmp) {
        var options = cmp.get("v.options");
        var value = cmp.get("v.value");
        var option = _.find(options, ["$selected", true]);
        if(option && _.includes(value, option.value)) {
            var index = _.indexOf(value, option.value);
            if(index > 0) {
                this.swap(value, index, index - 1);
                cmp.set("v.value", value);
                this.fireEvent(cmp, "onchange");
            }
        }
    },

    handleDownButtonClick: function(cmp) {
        var options = cmp.get("v.options");
        var value = cmp.get("v.value");
        var option = _.find(options, ["$selected", true]);
        if(option && _.includes(value, option.value)) {
            var index = _.indexOf(value, option.value);
            if(index < _.size(value) - 1) {
                this.swap(value, index, index + 1);
                cmp.set("v.value", value);
                this.fireEvent(cmp, "onchange");
            }
        }
    },

    handleValueChange: function(cmp) {
        var value = cmp.get("v.value");
        var options = cmp.get("v.options");
        var privateSourceOptions = _.filter(options, function(option) {
            return !_.includes(value, option.value);
        });
        cmp.set("v.privateSourceOptions", privateSourceOptions);

        var privateSelectedOptions = _.chain(value).
            map(function(val) {
                return _.find(options, ["value", val]);
            }).
            compact().
            value();
        cmp.set("v.privateSelectedOptions", []);
        cmp.set("v.privateSelectedOptions", privateSelectedOptions);
    },

    handleOptionClick: function(cmp, event) {
        var target = event.currentTarget;
        var index = _.parseInt(target.getAttribute("data-index"));
        var type = target.getAttribute("data-type");
        var option = null;
        if(type === 'source-list') {
            option = cmp.get("v.privateSourceOptions")[index];
        }
        else {
            option = cmp.get("v.privateSelectedOptions")[index];
        }
        var options = cmp.get("v.options");
        _.each(options, function(o) {
            o.$selected = o === option;
        });
        cmp.set("v.options", options);
    },

    doCustomValidation: function(cmp) {
        var required = cmp.get("v.required");
        var value = cmp.get("v.value");
        var validity = cmp.get("v.validity");
        if(validity) {
            if(required && _.isEmpty(value)) {
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
        var domNode = component.find('private').getElement();
        domNode.focus();
    },

    showHelpMessageIfInvalid: function(component) {
        this.showHelpMessage(component);
    },

    showHelpMessage: function(component) {
        this.updateHelpMessage(component);
    },
})
