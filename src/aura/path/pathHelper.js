({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var variant = cmp.get('v.variant');
        var classnames = this.classnamesLibrary.classnames('slds-path', {
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    adjustCloseButtonClass: function(cmp) {
        var action = cmp.get("v.action");
        if(action) {
            var button = action[0];
            if(button) {
                var className = button.get("v.class");
                button.set("v.class", (className ? className : '') + ' slds-path__mark-complete');
            }
        }
    },

    computeCurrentValue: function(cmp) {
        var stages = cmp.get("v.stages");
        var value = cmp.get("v.value");
        var privateCurrentIndex = _.findIndex(stages, ["value", value]);
        cmp.set("v.privateCurrentIndex", privateCurrentIndex);
    },
})
