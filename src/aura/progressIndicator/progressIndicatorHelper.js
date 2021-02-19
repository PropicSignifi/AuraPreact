({
    handleValueChange: function(cmp, event) {
        var options = cmp.get("v.options");
        var value = cmp.get("v.value");
        var privateOptions = options;
        var index = _.findIndex(privateOptions, ["value", value]);
        if(index >= 0) {
            var option = privateOptions[index];
            _.each(privateOptions, function(o, i) {
                o.$completed = i < index;
                o.$active = i === index;
            });
            var total = _.size(privateOptions);
            if(total > 1) {
                var privatePercent = 100 * index / (total - 1);
                cmp.set("v.privatePercent", privatePercent);
                var privateOffsetPercent = 15 + 70 * index / (total - 1);
                cmp.set("v.privateOffsetPercent", privateOffsetPercent);
            }
            if(option) {
                cmp.set("v.privateTooltip", option.label);
            }
        }
        cmp.set("v.privateOptions", privateOptions);
    },

    handleOptionClick: function(cmp, event) {
        var target = event.currentTarget;
        var index = _.parseInt(target.getAttribute("data-index"));
        var privateOptions = cmp.get("v.privateOptions");
        var option = privateOptions[index];
        if(option) {
            cmp.set("v.value", option.value);
            this.fireEvent(cmp, "onchange");
        }
    },

    handleMouseOver: function(cmp, event) {
        var target = event.currentTarget;
        var index = _.parseInt(target.getAttribute("data-index"));
        var privateOptions = cmp.get("v.privateOptions");
        var option = privateOptions[index];
        var total = _.size(privateOptions);
        if(total > 1) {
            var privateOffsetPercent = 15 + 70 * index / (total - 1);
            cmp.set("v.privateOffsetPercent", privateOffsetPercent);
        }
        if(option) {
            cmp.set("v.privateTooltip", option.label);
        }

        var tooltip = cmp.find("tooltip");
        $A.util.removeClass(tooltip, "slds-hide");
    },

    handleMouseOut: function(cmp, event) {
        var tooltip = cmp.find("tooltip");
        $A.util.addClass(tooltip, "slds-hide");
    },
})
