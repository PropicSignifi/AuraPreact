({
    computeClassNames: function(cmp) {
        var expanded = cmp.get("v.expanded");
        var classes = cmp.get('v.class');
        var classnames = this.classnamesLibrary.classnames('slds-section', {
            'slds-is-open': expanded,
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    toggle: function(cmp) {
        var expanded = cmp.get("v.expanded");
        cmp.set("v.expanded", !expanded);
    },
})
