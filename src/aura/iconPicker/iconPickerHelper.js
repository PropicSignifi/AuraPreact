({
    initializeValue: function(cmp) {
        var category = cmp.get("v.category");
        cmp.set("v.privateGetSuggestions", function() {
            var sprite = window.$Icons.getSprite(category);
            return _.chain(Object.keys(sprite)).
                map(function(key) {
                    var iconName = category + ':' + key;
                    return {
                        label: iconName,
                        value: iconName,
                        iconName: iconName,
                        iconContainer: "icon",
                    };
                }).
                sortBy('value').
                value();
        });

        this.handleValueChange(cmp);
    },

    focus: function(cmp) {
        cmp.find("private").focus();
    },

    showHelpMessageIfInvalid: function(cmp) {
        cmp.find("private").showHelpMessageIfInvalid();
    },

    handleValueChange: function(cmp) {
        var value = cmp.get("v.value");
        if(value) {
            cmp.set("v.privateValue", {
                id: value,
                value: value,
                iconName: value,
                iconContainer: "icon",
            });
        }
        else {
            cmp.set("v.privateValue", null);
        }
    },

    onValueChange: function(cmp) {
        var privateValue = cmp.get("v.privateValue");
        if(privateValue) {
            cmp.set("v.value", privateValue.id);
        }
        else {
            cmp.set("v.value", "");
        }
        this.showHelpMessageIfInvalid(cmp);
        this.fireEvent(cmp, "onchange");
    },
})
