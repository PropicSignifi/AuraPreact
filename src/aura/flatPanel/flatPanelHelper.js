({
    computeClassNames: function(cmp) {
        var classes = cmp.get('v.class');
        var expandable = cmp.get("v.expandable");
        var expanded = cmp.get("v.expanded");
        var classnames = this.classnamesLibrary.classnames('slds-flat-panel', {
            'slds-flat-panel_expandable': expandable,
            'slds-is-open': expanded,
        }, classes);
        cmp.set('v.privateComputedClass', classnames);
    },

    onClickHeader: function(cmp) {
        var expandable = cmp.get("v.expandable");
        var expanded = cmp.get("v.expanded");
        if(expandable) {
            expanded = !expanded;
            cmp.set("v.expanded", expanded);
        }
    },
})
